import React from "react";

import { Row, Col, Card, CardBody } from "reactstrap";

import { generateQuoteMap } from "./mockData";

import Board from "./board/Board";
import { Button } from "react-bootstrap";

function Boards() {
  const data = {
    medium: generateQuoteMap(100),
    large: generateQuoteMap(500)
  };

  return (
    <>

      <Board initial={data.medium} withScrollableColumns />
    </>
  );
}
export default Boards