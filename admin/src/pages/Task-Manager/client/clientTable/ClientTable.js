import React, { useState } from "react";
import MainLoader from "../../../../constants/Loader/loader";
import { Table, Form, Button, Card, } from 'react-bootstrap';
import HeaderMain from "../../header/HeaderMain";
const ClientTable = () => {
    let getUsers = false
    const dummyDataCustomer = [{
        name: "testing",
        project: 'task management',
        description: 'testing',
        status: true
    },
    {
        name: "testing",
        project: 'task management',
        description: 'testing',
        status: true
    },
    {
        name: "testing",
        project: 'task management',
        description: 'testing',
        status: true
    }]
    return(<>
    <div>
            {getUsers?.loading ? (
                        <MainLoader />
                    ) : (
                        <Table className="mb-0 add_Color_font" striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th> First Name</th>
                                    <th>Project</th>
                                    <th>Description</th>
                                    <th> Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <>
                                    {dummyDataCustomer?.map((ele, ind) => {
                                        return (
                                            <tr className="align-middle">
                                                <th scope="row">{ind + 1}</th>
                                                <td className="cp">
                                                    <span className="namelink"> {ele?.name} </span>
                                                </td>
                                                <td className="cp">
                                                    <span className="namelink"> {ele?.project} </span>
                                                </td>
                                                <td className="w-20">
                                                    <span className="namelink"> {ele?.description}</span>
                                                </td>
                                                <td>
                                                    <span className="namelink">
                                                        <Form.Check
                                                            type="switch"
                                                            checked={ele?.status}
                                                        />
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </>
                            </tbody>
                        </Table>
                    )}
        </div>
    </>)

}

export default ClientTable;