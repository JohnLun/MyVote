import React from 'react';
import BellIcon from 'react-bell-icon';

const ForwardedBellIcon = React.forwardRef((props, ref) => (
    <div ref={ref}>
        <BellIcon {...props} />
    </div>
));

export default ForwardedBellIcon;
