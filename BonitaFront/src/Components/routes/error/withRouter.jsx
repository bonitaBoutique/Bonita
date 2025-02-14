import { useNavigate } from 'react-router-dom';

export const withRouter = (Component) => {
  const WrappedComponent = props => {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };

  WrappedComponent.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};