const getKey = (name) => {
    return name.replace(" ", "") + "-" + Math.floor(Math.random() * 90 + 10);
};

const Page = (props) => {
    function hasDataObj(data) {
        if (data && data.length > 0 && (typeof data[0] == 'object' || data[0] instanceof Object))
            return data.map(drug => <Page level={props.level+1} {...drug} key={getKey(drug.name)}/>);
    };

    function hasDataList(data) {
        if (data && data.length > 0 && (typeof data[0] == 'string' || data[0] instanceof String)) {
            const list = data.map(drug => <li key={getKey(drug)}>{drug}</li>);
            return <ul className="drug-list" key={getKey(props.name)}>{list}</ul>;
        }
    };

    const {name, level, style, data} = props;
    const nodes = [];
    nodes.push(hasDataObj(data));
    nodes.push(hasDataList(data));

    return (
        <div className="section">
            <div className={`item-level-${level} ${style !== undefined ? style : ""}`}>{name}</div>
            {nodes}
        </div>
    )
}

class Section extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expand: this.props.expand !== undefined ? this.props.expand : false
        };
        this.expandItem = this.expandItem.bind(this);
    }

    expandItem() {
        if (this.props.expand === undefined)
            this.setState(prevState => {
                return {expand: !prevState.expand}
            });
    }

    hasChildren(children) {
        if (children && children.length > 0)
            return children.map(drug => <Section level={this.props.level+1} {...drug} key={getKey(drug.name)}/> )
    };

    render() {
        const {name, level, style, children, data} = this.props;
        const nodes = [];
        nodes.push(this.hasChildren(children));
        if (data)
            nodes.push(data.map(item => <Page {...item} />));
        
        let label = name;
        if (children)
            label = `${name} - (${children.length})`;
        
        return (
            <div className="section">
                <div className={`item-level-${level} ${style !== undefined ? style : ""}`} onClick={nodes.length > 0 ? this.expandItem : null}>{label}</div>
                {this.state.expand && nodes}
            </div>
        )
    }
}

class Window extends React.Component {
    constructor() {
        super();
        this.state = {drugs: []};
    }

    componentDidMount() {
        fetch(this.props.src)
            .then((res) => res.json())
            .then((data) => this.setState({drugs: data.children}))
            .catch(err => console.error(err));
    };

    render() {
        return this.state.drugs.map(drug =>
            <Section level={1} {...drug} key={getKey(drug.name)}/>);
    }
}

ReactDOM.render(
    <Window src="data.json"/>,
    document.getElementById('root')
);