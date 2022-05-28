import React from 'react';

import { Navbar, Row, Col } from 'react-bootstrap';

////////////////////
// Component that encapsulates the main home page for the app 
////////////////////
class HomePage extends React.Component {

  render() {

    return (
      <div className="mainContent">
        <Row>
          <Col xs={12} sm={12} md={12} lg={12} xl={12}>
            <Navbar bg="dark" variant="dark" expand="lg">
              <Navbar.Brand href="#home" onClick={() => this.setState({ currentTab: 'drafts' })}>Historic Magic 'Enchant Worldle'</Navbar.Brand>
            </Navbar>
            <div>FOOBAR
              {/* {this.state.currentTab === 'PD' ? <PDList /> : false}
              {this.state.currentTab === 'PTR' ? <PTRList /> : false} */}
            </div>
          </Col>
        </Row>
      </div >
    );
  }
}

export default HomePage;