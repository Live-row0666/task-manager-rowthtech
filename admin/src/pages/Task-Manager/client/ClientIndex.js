import React, { useState } from "react";
import ClientTable from "./clientTable/ClientTable";
import HeaderMain from "../header/HeaderMain";
import { Button, Card } from "react-bootstrap"
const ClientIndex = () => {
    const [activeCustomer, setActiveCustomer] = useState(true)

    return (<>
        <Card>
            <Card.Body>
                <div>
                    <HeaderMain />
                </div>
                <div className="row mx-auto">
                    <div className="d-flex col-4 mt-3">
                        <div className="row d-flex align-items-center">
                            <div className={`col-auto  cp ${activeCustomer ? 'Active_data' : 'InActive_data'}`}>
                                <p className="p-0 m-0 p-1 cp"
                                    onClick={() => { setActiveCustomer(!activeCustomer) }}>
                                    Active
                                </p>
                            </div>
                            <div className={`col-auto  cp ${!activeCustomer ? 'Active_data' : 'InActive_data'}`}>
                                <p className=" p-0 m-0 p-1 cp"
                                    onClick={() => { setActiveCustomer(!activeCustomer) }}>
                                    Inactive
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4 d-flex align-items-center justify-content-center">
                        <h4 className="header-title heading_data"> Client</h4>
                    </div>
                    <div className="col-4 d-flex align-items-center justify-content-end pe-0">
                        <Button
                            className="web_button"
                            variant="info"
                        >
                            Upload <span className="ms-1">
                                <i class="bi bi-arrow-down-circle"></i>
                            </span>
                        </Button>
                    </div>
                </div>
                <div>
                    <ClientTable />
                </div>
            </Card.Body>
        </Card>
    </>)

}

export default ClientIndex