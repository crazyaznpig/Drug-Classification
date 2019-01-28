const Page = (props) => {
    function hasDataObj(data) {
        if (data && data.length > 0 && (typeof data[0] == 'object' || data[0] instanceof Object))
            return data.map((drug, index) => <Page level={props.level+1} {...drug} key={"obj" + drug + index}/>);
    };

    function hasDataList(data) {
        if (data && data.length > 0 && (typeof data[0] == 'string' || data[0] instanceof String)) {
            const list = data.map((drug, index) => <li key={index}>{drug}</li>);
            return <ul className="drug-list" key={"drug-list-" + data.length + props.name}>{list}</ul>;
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
            return children.map((drug, index) => <Section level={this.props.level+1} {...drug} key={"children" + index} setWindow={this.props.setWindow}/> )
    };

    render() {
        const {name, level, style, children, data} = this.props;
        const nodes = [];
        nodes.push(this.hasChildren(children));
        if (data)
            nodes.push(data.map((item, index) => <Page key={"page" + index} {...item} />));
        
        let label = name;
        if (children)
            label = `${name} - (${children.length})`;
        
        let clickHandler = null;
        if (data && this.props.setWindow !== undefined)
            clickHandler = () => this.props.setWindow(nodes);
        else if (nodes.length > 0)
            clickHandler = this.expandItem;

        return (
            <div className="section">
                <div className={`item-level-${level} ${style !== undefined ? style : ""}`} onClick={clickHandler}>{label}</div>
                {this.state.expand && nodes}
            </div>
        )
    }
}

const Toggle = (props) => {
    return (
        <div id="ChangeView">
            <span className={`toggle-button ${props.selected === "list" ? "selected" : ""}`}
                onClick={() => props.handler("list")}>List</span>
            <span className={`toggle-button ${props.selected === "split" ? "selected" : ""}`}
                onClick={() => props.handler("split")}>Split</span>
        </div>
    );
}

class Window extends React.Component {
    constructor() {
        super();
        this.state = {
            drugs: [],
            view: "list",
            window: []
        };
        this.setView = this.setView.bind(this);
        this.setWindow = this.setWindow.bind(this);
    }

    componentDidMount() {
        fetch(this.props.src)
            .then((res) => res.json())
            .then((data) => this.setState({drugs: data.children}))
            .catch(err => console.error(err));
    };

    setView(target) {
        this.setState({view: target});
    }
    
    setWindow(nodes) {
        this.setState({window: nodes});
    }

    render() {
        switch (this.state.view) {
            case "split":
                return (
                    <div id="Split">
                        <Toggle selected={this.state.view} handler={this.setView}/>
                        <div id="SplitSelection">
                            {this.state.drugs.map((drug, index) => <Section level={1} {...drug} key={"split" + index} setWindow={this.setWindow}/>)}
                        </div>
                        <div id="SplitWindow">{this.state.window}</div>
                    </div>
                )
            case "list":
                return (
                    <>
                        <Toggle selected={this.state.view} handler={this.setView}/>
                        {this.state.drugs.map((drug, index) => <Section level={1} {...drug} key={"list" + index}/>)}
                    </>
                )
            default: return null
        }
    }
}

ReactDOM.render(
    <Window src="data.json"/>,
    document.getElementById('root')
);