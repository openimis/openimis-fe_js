import { Component, Children } from "react";
import PropTypes from "prop-types";

class ModulesManagerProvider extends Component {
    static propTypes = {
        modulesManager: PropTypes.object.isRequired,
    }
    static childContextTypes = {
        modulesManager: PropTypes.object.isRequired,
    }
    getChildContext() {
        const { modulesManager } = this.props
        return { modulesManager }
    }
    render() {
        return Children.only(this.props.children)
    }
}
export default ModulesManagerProvider