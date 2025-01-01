import { Tool } from "langchain/tools";

// input: ISO-3 (ISO 3166 alpha-3) codes of the country
// output:
// https://hapi.humdata.org/api/v1/coordination-context/conflict-event
// ?app_identifier=VFJJREVOVDp5dWlzZWtpQGdtYWlsLmNvbQ==
// &output_format=json
// &limit=100
// &offset=0
// &location_code=SSD
