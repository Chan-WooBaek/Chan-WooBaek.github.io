import React from 'react';
import CreateListingForm from '../screens/CreateListingScreen';
// import EditButton from '../components/EditButton';
import HostedListingsDisplay from '../components/HostedListingsDisplay';
import PropTypes from 'prop-types';
import BasicMenu from '../components/ProfileMenu'

HostedListingsScreen.propTypes = {
  isLoggedIn: PropTypes.bool,
  setLoggedIn: PropTypes.func
}

export default function HostedListingsScreen ({ isLoggedIn, setLoggedIn }) {
  return (
    <div>
      HostedListingsScreen
      {/* <EditButton id={202301096}></EditButton> */}
      {isLoggedIn
        ? <>
            <BasicMenu isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn}></BasicMenu>
            <CreateListingForm></CreateListingForm>
            <HostedListingsDisplay></HostedListingsDisplay>
          </>
        : <>
            {'Not LoggedIn'}
          </>
      }
    </div>
  );
}
