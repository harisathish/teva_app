import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { DEAL_ROUTES } from "../constants/routes";
import useDealFormStore from "../store/useDealFormStore";
import {
  ACCOUNT_LIST,
  API_ENDPOINT,
  BRAND_LIST,
  CHANNEL_LIST,
  CONTRACT_TERMS,
  LOOKBACK_TERMS,
} from "../constants/ui";
//import dealIdData from "../../data/dealIdData.json";
import { getQuarterBetweenDates, convertQuarterString, convertDateToQuarterCode } from "../utils/utils";

const convertQuarter = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const convert = (str) => {
    const [quarter, year] = str.split("Q");
    return Number(`${year}${quarter}`);
  };

  const first = convert(arr[0]);
  const last = convert(arr[arr.length - 1]);

  return `${first},${last}`;
};

const ClientAndBidInformation = () => {
  const {
    dealId,
    dealDescription,
    brand,
    account,
    channel,
    contractStart,
    contractEnd,
    contractLength,
    lookbackStartDate,
    lookbackEndDate,
    lookBackPeriod,
    updateField,
    setMarketBasketRecords,
    fetchData,
    insertData,
    error,
    loading,
  } = useDealFormStore();

  const navigate = useNavigate();

  const [newDealId, setNewDealId] = useState(false);
  const [selectDealId, setSelectDealId] = useState(null);
  const [isGetData, setIsGetData] = useState(false);
  const [isSubmitBtnClicked, setIsSubmitBtnClicked] = useState(false);
  const [dealIdData, setDealIdData] = useState([])
  const [dealIdDataList, setDealIdDataList] = useState([])


  //useEffect(() => {
    //handleNewDealId();
  //  setDealIDList(dealName)
  //}, [dealIDList]);

  useEffect(() => {
     const response = fetch("/fetchDealIds");
    
    //console.log(response)
    
    response.then(data => {
      data.json().then(result => {        
        
        // console.log(result.dealIds)
        //updateField("dealId", result.dealId);
        console.log(result.dealIds)
        setDealIdDataList(result.dealIds)
        console.log(dealIdDataList)
    });
  });
  }, []);


  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const maxStartStr = new Date(today.setFullYear(today.getFullYear() + 5))
    .toISOString()
    .split("T")[0];

  const handleNewDealId = () => {
    const response = fetch("/createDealID");
    
    //console.log(response)
    
    response.then(data => {
      data.json().then(result => {        
        
        console.log(result.dealId)
        updateField("dealId", result.dealId);
    });
  });
  };

  const maxEndStr = contractStart
    ? new Date(
        new Date(contractStart).setFullYear(
          new Date(contractStart).getFullYear() + 5
        )
      )
        .toISOString()
        .split("T")[0]
    : "";

  const handleDealData = () => {
    updateField("dealId", selectDealId);
    updateField("dealDescription", dealDescription);
    const payload = {
      id: selectDealId
    };
    fetchData(API_ENDPOINT.fetchByDealId, payload, "dealId", true);
    setIsGetData(true);

    // const selectedItem = dealIdData.find(
    //   (item) => item.dealId.toString() === selectDealId
    // );

    // if (selectedItem) {
    //   // setSelectedId(true)
    //   updateField("brand", selectedItem.brand);
    //   updateField("account", selectedItem.account);
    //   updateField("channel", selectedItem.channel);
    //   updateField("contractLength", selectedItem.contract_length);
    //   updateField("contractStart", selectedItem.contract_start_date);
    //   updateField("contractEnd", selectedItem.contract_end_date);
    //   updateField("lookBackPeriod", selectedItem.lookback_period);
    //   updateField("lookbackStartDate", selectedItem.lookback_start_date);
    //   updateField("lookbackEndDate", selectedItem.lookback_end_date);
    //   updateField("dealDescription", selectedItem.dealDescription);
    // }
  };

  const calCulateLookBackDates = (period) => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const currentYear = now.getFullYear();

    let startQuarterIndex = currentQuarter - period;
    let startYear = currentYear;

    if (startQuarterIndex < 0) {
      startYear -= Math.ceil(Math.abs(startQuarterIndex) / 4);
      startQuarterIndex = ((startQuarterIndex % 4) + 4) % 4;
    }

    const startMonth = startQuarterIndex * 3;
    const start = new Date(startYear, startMonth, 1);

    let endQuarterIndex = currentQuarter - 1;
    let endYear = currentYear;
    if (endQuarterIndex < 0) {
      endQuarterIndex = 3;
      endYear -= 1;
    }

    const endMonth = endQuarterIndex * 3 + 2;
    const end = new Date(endYear, endMonth + 1, 0);

    const format = (date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${y}-${m}-${d}`;
    };

    const startFormatted = format(start);
    const endFormatted = format(end);

    updateField("lookbackStartDate", startFormatted);
    updateField("lookbackEndDate", endFormatted);
  };

  const handleLookbackPeriod = (period) => {
    calCulateLookBackDates(period);
    updateField("lookBackPeriod", period);
  };

  const formData = {
    dealId,
    dealDescription,
    brand,
    account,
    channel,
    contractStart,
    contractEnd,
    contractLength,
    lookbackStartDate,
    lookbackEndDate,
    lookBackPeriod,
  };
  let isFormValid = true;
  //isFormValid = Object.values(formData).every(
  //  (value) => value
  //);

  const prepareDealData = () => {
    const contractTermInQuarter = getQuarterBetweenDates(
      contractStart,
      contractEnd
    );
    const lookbackTermInQuarter = getQuarterBetweenDates(
      lookbackStartDate,
      lookbackEndDate
    );

    updateField("contractTermPeriods", contractTermInQuarter);
    updateField("lookbackTermPeriods", lookbackTermInQuarter);

    const ctPeriodInQuarter = convertQuarter(contractTermInQuarter);
    const lbPeriodInQuarter = convertQuarter(lookbackTermInQuarter);

    updateField("contractPeriodInQuarter", ctPeriodInQuarter);
    updateField("lookbackPeriodInQuarter", lbPeriodInQuarter);

    const totaltermInQuarter = [
      ...lookbackTermInQuarter,
      ...contractTermInQuarter,
    ];
    const markettRecords = totaltermInQuarter.map((quarter) => ({
      quarter,
      growth: 1.35,
      marketBasket: null,
      marketTrx: 0,
      marketShare: "",
      dealId,
      account,
      channel,
      brand,
      effective_start_date: lookbackStartDate,
      effective_end_date: contractEnd,
      modified_date: todayStr,
      modified_by: "",
      created_date: todayStr,
      created_by: "",
    }));

    setMarketBasketRecords(markettRecords);

    const totalPeriodInQuarter = convertQuarter(totaltermInQuarter);
    updateField("totalPeriodInQuarter", totalPeriodInQuarter);

    let grUnitPayload;
    if (newDealId) {
      grUnitPayload = { account, channel, brand, period: totalPeriodInQuarter };
    } else if (isGetData) {
      grUnitPayload = { dealId, period: totalPeriodInQuarter };
    }

    fetchData(API_ENDPOINT.fetchAssumptions, grUnitPayload, "basketGrowthUnit");

    return {
      lbPeriodInQuarter,
      totalPeriodInQuarter,
    };
  };

  const submitDealForm = () => {
    //const { lbPeriodInQuarter } = prepareDealData();
    const payload = {
      dealId,
      deal_name: dealDescription,
      brand,
      account,
      channel,
      contract_start_date: contractStart,
      contract_end_date: contractEnd,
      contract_length: contractLength,
      lookback_start_date: convertDateToQuarterCode(lookbackStartDate),
      lookback_end_date: convertDateToQuarterCode(lookbackEndDate),
      modified_date: todayStr,
      modified_by: "Ajovy User",
      created_date: todayStr,
      created_by: "Ajovy",
      lookback_period: Number(lookBackPeriod),
      deal_frozen: "N",
    };

    insertData(API_ENDPOINT.insertDealData, payload);
    setIsSubmitBtnClicked(true);
  };

  const handleNext = () => {
    prepareDealData();
    setIsSubmitBtnClicked(false);
    navigate(DEAL_ROUTES.UTILIZATIONANDMSDATA.PATH);
  };

  return (
    <Container className="w-50">
      <h1 className="mb-5 text-center text-teva-green">
        Deal / No Deal Contract Analysis
      </h1>
      <Form>
        {/* Deal ID */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Deal ID
          </Form.Label>
          <Col sm={6}>
            <Form.Control
              style={{ cursor: selectDealId ? "not-allowed" : "" }}
              value={dealId}
              readOnly
              className="bg-light"
            />
          </Col>
          <Col sm={2}>
            <Button
              disabled={selectDealId}
              style={{ cursor: !selectDealId ? "pointer" : "not-allowed" }}
              onClick={() => handleNewDealId()}
            >
              {dealId
                ? "New"
                : loading
                ? "Loading..."
                : error
                ? "Try Again"
                : "New"}
            </Button>
          </Col>
        </Form.Group>

        {/* Look Back Deal ID */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Look Back Deal ID
          </Form.Label>
          <Col sm={6}>
            <Form.Select
              value={selectDealId}
              disabled={dealId}
              style={{ cursor: dealId ? "not-allowed" : "" }}
              className="bg-light"
              onChange={(e) => setSelectDealId(e.target.value)}
            >
              <option value="">Select Deal ID</option>
              {dealIdDataList.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col sm={2}>
            <Button
              disabled={!selectDealId}
              style={{
                cursor: !selectDealId ? "not-allowed" : null,
              }}
              onClick={() => handleDealData()}
            >
              Get Data
            </Button>
          </Col>
        </Form.Group>

        {/* Deal Description */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Deal Description
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              value={dealDescription}
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              readOnly={isGetData}
              onChange={(e) => updateField("dealDescription", e.target.value)}
              placeholder="Deal Description"
              maxLength={50}
            />
          </Col>
        </Form.Group>

        {/* Brand */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Brand
          </Form.Label>
          <Col sm={8}>
            <Form.Select
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              value={brand}
              onChange={(e) => updateField("brand", e.target.value)}
            >
              <option value="" disabled>
                Select Brand
              </option>
              {BRAND_LIST.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        {/* Account */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Account
          </Form.Label>
          <Col sm={8}>
            <Form.Select
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              value={account}
              onChange={(e) => updateField("account", e.target.value)}
            >
              <option value="" disabled>
                Select Account
              </option>
              {ACCOUNT_LIST.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        {/* Channel */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Channel
          </Form.Label>
          <Col sm={8}>
            <Form.Select
              value={channel}
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              onChange={(e) => updateField("channel", e.target.value)}
            >
              <option value="" disabled>
                Select Channel
              </option>
              {CHANNEL_LIST.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        {/* Contract Terms */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Contract Terms
          </Form.Label>
          <Col sm={4}>
            <Form.Control
              type="date"
              value={contractStart}
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              min={todayStr}
              max={maxStartStr}
              onChange={(e) => updateField("contractStart", e.target.value)}
            />
          </Col>
          <Col sm={4}>
            <Form.Control
              type="date"
              value={contractEnd}
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              min={contractStart}
              max={maxEndStr}
              onChange={(e) => updateField("contractEnd", e.target.value)}
            />
          </Col>
        </Form.Group>

        {/* Length of Contract */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Length of Contract
          </Form.Label>
          <Col sm={8}>
            <Form.Select
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              value={contractLength}
              onChange={(e) => updateField("contractLength", e.target.value)}
            >
              <option value="" disabled>
                Select Year
              </option>
              {[...Array(CONTRACT_TERMS)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1} Year's
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        {/* Look Back Period */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Look Back Period
          </Form.Label>
          <Col sm={8}>
            <Form.Select
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : "" }}
              value={lookBackPeriod}
              onChange={(e) => handleLookbackPeriod(e.target.value)}
            >
              <option value="" disabled>
                Select Quarter
              </option>
              {[...Array(LOOKBACK_TERMS)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1} Quarter
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        {/* Look Back Terms */}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>
            Look Back Terms
          </Form.Label>
          <Col sm={4}>
            <Form.Control
              value={lookbackStartDate}
              type="text"
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : null }}
            />
          </Col>
          <Col sm={4}>
            <Form.Control
              value={lookbackEndDate}
              disabled={isGetData}
              style={{ cursor: isGetData ? "not-allowed" : null }}
              type="text"
            />
          </Col>
        </Form.Group>

        {/* Submit Buttons */}
        <Form.Group as={Row} className="mb-3">
          <Col sm={4}></Col>
          <Col
            style={{
              cursor:
                isGetData || !newDealId || newDealId ? "not-allowed" : null,
            }}
            sm={8}
          >
            {!isGetData && (
              <Button
                disabled={!isFormValid}
                className={`vi-btn-solid-magenta vi-btn-solid ${
                  isGetData || !newDealId ? "btn-blocked" : ""
                }`}
                onClick={submitDealForm}
              >
                SUBMIT
              </Button>
            )}
            <Button
              variant="success"
              disabled={!(isSubmitBtnClicked || isGetData)}
              className={`vi-btn-solid-magenta vi-btn-solid ${
                !(isSubmitBtnClicked || isGetData) ? "btn-blocked" : ""
              }`}
              onClick={handleNext}
            >
              NEXT
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default ClientAndBidInformation;
