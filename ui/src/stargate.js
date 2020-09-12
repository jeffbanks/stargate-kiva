
const methods = {
  get: "GET",
  post: "POST",
  put: "PUT",
  patch: "PATCH",
  delete: "DELETE",
};

const request = async (
  url = "",
  method = "",
  accessToken = "",
  data = null
) => {

  let res = undefined;
  if (method === methods.get) {
    res = await fetch(url, {
      method,
      headers: {
        Accepts: "application/json",
        "Content-Type": "application/json",
        "X-Cassandra-Token": accessToken,
      },
      redirect: "follow",
    });
    return res;
  }

  res = await fetch(url, {
    method,
    headers: {
      Accepts: "application/json",
      "Content-Type": "application/json",
      "X-Cassandra-Token": accessToken,
    },
    redirect: "follow",
    body: hasJsonStructure(data) ? data : JSON.stringify(data),
  });

  if (method === methods.delete) {
    return res;
  }
  return res;
};

// Performs check as we may already have a json structure.
const hasJsonStructure = (data) => {
  if (typeof data !== 'string') return false;
  try {
    const result = JSON.parse(data);
    const type = Object.prototype.toString.call(result);
    const isObjOrArray = Boolean(type === '[object Object]'
      || type === '[object Array]');
    return isObjOrArray;
  } catch (err) {
    return false;
  }
};

class Client {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  get(path) {
    return request(this.baseUrl + path, methods.get, this.accessToken);
  }

  post(path, data) {
    return request(this.baseUrl + path, methods.post, this.accessToken, data);
  }

  put(path, data) {
    return request(this.baseUrl + path, methods.put, this.accessToken, data);
  }

  patch(path, data) {
    return request(this.baseUrl + path, methods.patch, this.accessToken, data);
  }

  delete(path) {
    return request(this.baseUrl + path, methods.delete, this.accessToken);
  }
}

const createClient = async (connection, token) => {

  // Able to have .env entry with token for reuse.
  // if not specified, generate one!
  if (!token) {
    const res = await request(
      connection.baseUrl + "/api/rest/v1/auth",
      methods.post,
      "",
      {
        username: connection.username,
        password: connection.password,
      }
    );
    const jsonResult = await res.json();
    const authToken = jsonResult.authToken;
    return new Client(
      connection.baseUrl + "/api/rest/v2",
      authToken
    );
  } else {
    return new Client(
      connection.baseUrl + "/api/rest/v2", token
    );
  }
};

module.exports = { createClient, Client, request, methods };
