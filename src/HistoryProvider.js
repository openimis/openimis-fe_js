import { Component, Children } from "react";
import PropTypes from "prop-types";

class HistoryProvider extends Component {
    static propTypes = {
        history: PropTypes.object.isRequired,
    }
    static childContextTypes = {
        history: PropTypes.object.isRequired,
    }
    getChildContext() {
        const { history } = this.props
        return { history }
    }
    render() {
        return Children.only(this.props.children)
    }
}
export default HistoryProvider