const assert = require("assert");
const stargate = require("./stargate");
const _ = require("lodash");

require("dotenv").config();

describe("A collection of Stargate integration validations.", () => {

  let stargateAPI = null;
  const namespace = process.env.ASTRA_KEYSPACE;
  const collection = "loans";
  const loanId = "8675309";
  const loanName = "foo-man-choo";
  const docRootPath = `/namespaces/${namespace}/collections/${collection}/${loanId}`;

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

    const deleteResult = await stargateAPI.delete(docRootPath, {
      loanId: loanId,
    });
    assert(deleteResult);
    return deleteResult;
  });

  it("should put/replace a loan for loanId", async () => {

    const result = await stargateAPI.put(docRootPath, {
      loanId: loanId,
      loanName: loanName
    });
    console.log("result of put: ", result);
    assert(result);
    assert.strictEqual(result.status, 200);
    return result;
  });

  it("should get/search a loan by loanId", async () => {

    const putResult = await stargateAPI.put(docRootPath, {
      loanId: loanId,
      loanName: loanName
    });
    console.log("result of put: ", putResult);
    assert(putResult);
    assert.strictEqual(putResult.status, 200);

    let getResult = await stargateAPI.get(docRootPath);
    assert(getResult);
    getResult = await getResult.json();
    assert.strictEqual(getResult.data.loanId, loanId);
    assert.strictEqual(getResult.data.loanName, loanName);

    return getResult;
  });

  it("should delete/remove a loan by loanId", async () => {

    const putResult = await stargateAPI.put(docRootPath, {
      loanId: loanId,
      loanName: loanName
    });
    assert(putResult);
    assert.strictEqual(putResult.status, 200);

    const deleteResult = await stargateAPI.delete(docRootPath, {
      loanId: loanId,
    });
    assert(deleteResult);
    console.log("delete result: ", deleteResult);
    assert(deleteResult);
    return deleteResult;
  });


  it("should patch/update-part-of the loan with geo coordinates by loanId", async () => {

    // Given existing loan
    const putResult = await stargateAPI.put(docRootPath, {
      loanId: loanId,
      loanName: loanName
    });
    console.log("result of put: ", putResult);
    assert(putResult);
    assert.strictEqual(putResult.status, 200);

    // Update the load with geo coordinates
    let patchResult = await stargateAPI.patch(docRootPath, {
      longitude: "-78.6405738",
      latitude: "40.4086841"
    });
    assert(patchResult);
    console.log("patched result: ", patchResult);
    assert.strictEqual(patchResult.status, 200);
    patchResult = await patchResult.json();
    console.log("patchResult: ", patchResult);

    // Verify the patch
    let getResult = await stargateAPI.get(docRootPath);
    assert(getResult);
    console.log("getResult in patching: ", getResult);
    getResult = await getResult.json();
    assert.strictEqual(getResult.data.loanId, loanId);
    assert.strictEqual(getResult.data.loanName, loanName);
    assert.strictEqual(getResult.data.longitude, "-78.6405738");
    assert.strictEqual(getResult.data.latitude, "40.4086841");
    return getResult;

  });
});

