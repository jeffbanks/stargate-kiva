const assert = require("assert");
const stargate = require("./src/stargate");
const _ = require("lodash");
const { processSingleLine, processAll } = require("./stargate-loader");

require("dotenv").config();

describe("A collection of Stargate integration validations.", () => {

  let stargateAPI = null;
  let id = "8675309";
  let countryCode = "KE";

  const collection = "loans";
  const namespace = process.env.ASTRA_KEYSPACE;
  const docRootPath = `/namespaces/${namespace}/collections/${collection}`;

  // Create our stargate API instance.
  before(async () => {
    stargateAPI = await stargate.createClient({
      baseUrl: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com`,
      username: process.env.STARGATE_USERNAME,
      password: process.env.STARGATE_PASSWORD,
    }, process.env.TOKEN);
    return stargateAPI;
  });

  // Cleanup any stale test state.
  beforeEach(async () => {

    const deleteResult = await stargateAPI.delete(docRootPath + `/${id}`, {
      id: id,
    });
    assert(deleteResult);
    return deleteResult;
  });

  it("should put/replace a loan for id", async () => {

    const result = await stargateAPI.put(docRootPath + `/${id}`, {
      id: id,
      country_code: countryCode
    });
    assert(result);
    assert.strictEqual(result.status, 200);
    return result;
  });

  it("should get/search a loan by id", async () => {

    const putResult = await stargateAPI.put(docRootPath + `/${id}`, {
      id: id,
      country_code: countryCode
    });
    assert(putResult);
    assert.strictEqual(putResult.status, 200);

    let getResult = await stargateAPI.get(docRootPath + `/${id}`);
    assert(getResult);
    getResult = await getResult.json();
    assert.strictEqual(getResult.data.id, id);
    assert.strictEqual(getResult.data.country_code, countryCode);

    return getResult;
  });

  it("should delete/remove a loan by id", async () => {

    const putResult = await stargateAPI.put(docRootPath + `/${id}`, {
      id: id,
      country_code: countryCode
    });
    assert(putResult);
    assert.strictEqual(putResult.status, 200);

    const deleteResult = await stargateAPI.delete(docRootPath + `/${id}`, {
      id: id,
    });
    assert(deleteResult);
    assert(deleteResult);
    return deleteResult;
  });

  it("should patch/update-part-of the loan with geo coordinates by id", async () => {

    // Given existing loan
    const putResult = await stargateAPI.put(docRootPath + `/${id}`, {
      id: id,
      country_code: countryCode
    });
    assert(putResult);
    assert.strictEqual(putResult.status, 200);

    // Update the load with geo coordinates
    let patchResult = await stargateAPI.patch(docRootPath + `/${id}`, {
      longitude: "-78.6405738",
      latitude: "40.4086841"
    });
    assert(patchResult);
    assert.strictEqual(patchResult.status, 200);
    patchResult = await patchResult.json();

    // Verify the patch
    let getResult = await stargateAPI.get(docRootPath + `/${id}`);
    assert(getResult);
    getResult = await getResult.json();
    assert.strictEqual(getResult.data.id, id);
    assert.strictEqual(getResult.data.country_code, countryCode);
    assert.strictEqual(getResult.data.longitude, "-78.6405738");
    assert.strictEqual(getResult.data.latitude, "40.4086841");
    return getResult;
  });

  it("load single line from file", async () => {

    id = "888888888";
    const singleLine = await processSingleLine(stargateAPI, docRootPath + `/${id}`, id);
    await stargateAPI.put(docRootPath + `/${id}`, singleLine);

    let getResult = await stargateAPI.get(docRootPath + `/${id}`);
    assert(getResult);
    getResult = await getResult.json();
    assert.strictEqual(getResult.data.id, id);
    return getResult;
  });
});


