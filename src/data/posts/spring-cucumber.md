---
title: SpringBoot based integration testing for microservices using Cucumber and Rest Assured
date: '2018-11-21'
author: Tarun Sukhu <tsukhu@hcl.com>
tags: springboot, cucumber, bdd, rest assured
excerpt: A reference implementation which provides the best practices of running integration & component tests in a SpringBoot application
---

## OBJECTIVE

* Create a reference implementation which provides the best practices of running integration & component tests in a SpringBoot application
* While Rest Assured provides an excellent DSL to quickly create component and integration tests , using Cucumber will provide us a not only creating readable and maintainable code , but also being able communicate the requirements across various stakeholdes in a human readable language.
* Gherkin (used by Cucumber to define the automated tests) along with Rest Assured provides a very effective solution for the same.
* For Component level tests - we can mock the external apis 
* For Integration level tests - a different provide can be used to use actual APIs rather than mocks

### TECHNOLOGIES

* Spring Boot Test - Provides the spring boot ecosystem required for the tests
* Rest Assured - Provides the service client APIs using the powerful DSL for creating maintainable tests
* Rest Assured JSON Schema Validator - Response Schema Validation
* Hamcrest - Assertions
* Swagger Request Validator for Rest Assured (`swagger-request-validator-restassured`) - Use Rest Assured to validate the API response using the swagger spec (TBD)
* Cucumber (with Spring Boot) - BDD based Integration Test and Component Tests
* Spring Cloud Contract WireMock
    * The WireMock server is setup using the `@AutoConfigureWireMock(port = 8090)` annotation
    * Also mock responses are setup either programmatically wiremock APIs using the json files or placing the wiremock stubs in the [test/resource/mappings](src/test/resources/mappings) folder
    * As an example the google books api has been wiremock stub has been recorded using the [wiremock standalone server](http://wiremock.org/docs/record-playback/) 
    * The programmaticaly created wiremock stubs are demonstrated in the files [OrderSteps](src/test/java/com/tsukhu/demo/steps/OrderSteps.java) and [SwapiSteps](src/test/java/com/tsukhu/demo/steps/SwapiSteps.java) 
* Spring Profiles to use the same test using the mock server or hitting the actual endpoints
    * `Dev Mode` - All external endpoints are provided using the WireMock server that serves the responses via stubs and mock json output
    * `Integration Mode` - Actual endpoints are hit
* Automatic Pact file generation for each of the test scenarios , based on the registered Pact listeners using `wiremock-pact-generator`
    * This can be extended to push the generated pact files to the Pact broker
    * This is enabled in the `dev` profile and at the end of the execution the `target\pacts` folder contains the generated pact files
    * Advantage
        * No need of writing separate pact consumer tests.
        * This ensures that what tests you write as BDD cucumber tests also double up as pact tests


## PROJECT DETAILS


<img src="/project/images/spring-cucumber.png" alt="BDD" width="550" height="300">

- Project URL https://github.com/ERS-HCL/springboot-cucumber-demo

## CONTRIBUTOR(S)

Tarun Sukhu <tsukhu@hcl.com>
