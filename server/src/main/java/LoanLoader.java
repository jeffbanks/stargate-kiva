import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class LoanLoader
{
    private static final int MAX_LOANS_TO_LOAD = 100;
    private static String token;
    private final CloseableHttpClient httpClient = HttpClients.createDefault();
    private final ObjectMapper mapper = new ObjectMapper();
    private String astraDatabaseId;
    private String astraRegion;
    private String baseAstraUrl;
    private String astraDatabaseUser;
    private String astraDatabasePassword;
    private String namespaceId;
    private String collectionId;

    public LoanLoader()
    {
        // Dan's cluster
//        astraDatabaseId = "e7959d8b-a174-4a74-990c-16d547fbaaea";
//        astraRegion = "us-east1";
//        astraDatabaseUser = "coloneljack";
//        astraDatabasePassword = "coloneljack";
//        namespaceId = "kiva";
//        collectionId = "danjtest";

        // TODO: get from environment
        astraDatabaseId = "992d6ea1-5cc8-4636-8b4a-4f6fede43f4c";
        astraRegion = "us-east1";
        astraDatabaseUser = "kiva";
        astraDatabasePassword = "kiva123";
        namespaceId = "kiva";
        collectionId = "loans";

        baseAstraUrl = String.format("https://%s-%s.apps.astra.datastax.com/api/rest", astraDatabaseId, astraRegion);
    }

    public static void main(String[] args) throws Exception
    {
        LoanLoader loanLoader = new LoanLoader();

        // Get auth token
        token = loanLoader.getAuthToken();

        // List of existing loans so we do not load them again and create a duplicate document
        String[] existingLoanIds = {
                // These id's are from Dan's database
                // "1315314", "666025", "240074", "624279", "1369466", "119028", "1743327", "1605678", "185243", "1655299", "1944378", "1883146", "1216523", "655128", "385297", "880209", "775788", "986540", "1185786", "1927752", "682191", "960306", "799207", "1401523", "1535425", "938271", "827034", "1692876", "133355", "1369711", "1847217", "460473", "289351", "462109", "1300882", "666262", "1904911", "460559"
             
                // These are from: astraDatabaseId = "992d6ea1-5cc8-4636-8b4a-4f6fede43f4c";
                "1535425", "1554808", "827034", "176607", "185243", "528554", "1217145", "700370", "1973931", "690035", "1828068", "1904911", "930699", "1512214", "899742", "1049521", "1102884", "1996692", "1709433", "237474", "1883146", "327745", "99999999", "1886229", "1736350", "1369466", "595417", "799207", "460473", "1401729", "1401523", "61349", "307642", "202716", "7408", "405034", "1952716", "1216523", "1562501", "775788", "1655299", "1299362", "1540532", "682191", "1187660", "1847217", "1142814", "986540", "1808183", "655128", "1185786", "1738715", "1636319", "1835127", "221670", "397840", "1738798", "666025", "960306", "1094427", "107449", "745242", "1456461", "620924", "1605678", "219134", "1716324", "129238", "133355", "1779743", "749526", "760647", "1841974", "1585679", "373119", "1674105", "1315314", "1300882", "653508", "1927752", "624279", "1767344", "1021199", "1529053", "108116", "326040", "823660", "1716915", "204252", "677956", "1025552", "610974", "462109", "1586757", "202938", "1761843", "1663843", "853008", "186179", "1644971"
        };
        List<String> existingLoans = new ArrayList<>();
        existingLoans.addAll(Arrays.asList(existingLoanIds));

        List<Loan> loans;
        // Load some loan data
//        loans = loanLoader.loadLoans(existingLoans);
//        System.out.println(String.format("Loaded %d loans", loans.size()));
//        for (Loan loan : loans)
//        {
//            System.out.println("Loaded: " + loan);
//        }

        System.out.println();
        System.out.println();
        
        // Query for loans - unfortunately this loan data
        // doesn't have all the loan fields. Can't get the 
        // query to return them all.
        // The loop will re-query each loan document to get all the fields.
        List<Loan> getloans = loanLoader.getLoans();
        List<Loan> allLoans = new ArrayList<>();
        System.out.println(String.format("Queried %d loans", getloans.size()));
        for (Loan loan : getloans)
        {
            // Query again to get all the fields
            Loan queryLoan = loanLoader.getLoan(loan.documentId);
            allLoans.add(queryLoan);
        }

        // Print a list of all the loan ids; these can be used to prevent 
        // duplicate loans from being loaded again (see 'existingLoanIds')
        System.out.println(String.format("IDs of all %d loans:", allLoans.size()));
        for (Loan loan : allLoans)
        {
            System.out.print(String.format("\"%s\", ", loan.id));
        }
        System.out.println();

        // DocumentIds
        for (Loan loan : allLoans)
        {
            System.out.print(String.format("\"%s\", ", loan.documentId));
        }
        System.out.println();

        // DELETE loans
//        for (Loan loan : allLoans)
//        {
//            loanLoader.deleteLoan(loan);
//        }
    }

    private List<Loan> loadLoans(List<String> existingLoans) throws Exception
    {
        String pathname = "/Users/dan.jatnieks/Downloads/kiva_ds_json/loans.json";
        FileInputStream fileInputStream = new FileInputStream(pathname);
        JsonFactory factory = mapper.getFactory();
        JsonParser parser = factory.createParser(fileInputStream);

        JsonToken token = parser.nextToken();
        if (JsonToken.START_ARRAY.equals(token))
        {
            System.out.println("START_ARRAY");
        }
        token = parser.nextToken();
        if (JsonToken.START_OBJECT.equals(token))
        {
            System.out.println("START_OBJECT");
        }

        List<Loan> loans = new ArrayList<>();
        int loadedLoans = 0;
        while (loadedLoans < MAX_LOANS_TO_LOAD)
        {
            Loan loan = mapper.readValue(parser, Loan.class);
            if (existingLoans.contains(loan.id))
            {
                System.out.println("Skipping existing loan: " + loan.id);
                continue;
            }

            // Get geo location data
            if (loan.town == null || loan.town.isEmpty()
                || loan.country_name == null || loan.country_name.isEmpty())
            {
                System.out.println(String.format("Empty town or country, skipping loan: %s", loan.id));
                continue;
            }
            String loanLocation = String.format("%s,%s", loan.town, loan.country_name);
            System.out.println("loan location string: " + loanLocation);
            LocationData locationData = getLocationData(loanLocation);
            if (locationData != null)
            {
                loan.lat = locationData.lat;
                loan.lon = locationData.lon;
                loan.location_name = locationData.name;
                loan.location_type = locationData.type;

                System.out.println("Posting loan: " + loan);
                String documentId = postLoan(loan);
                loan.documentId = documentId;
                loans.add(loan);
                loadedLoans++;
            }
            else
            {
                System.out.println("Could not determine geo location data - skipping loan: " + loan);
            }

            // Slow to not exceed the per minute limit for location data api
            Thread.sleep(2000);
        }
        System.out.println(String.format("Loaded %d new loans", loans.size()));
        return loans;
    }

    private Loan getLoan(String documentId) throws IOException, URISyntaxException
    {
        // /api/rest/v2/namespaces/{namespace-id}/collections/{collection-id}/{document-id}
        URI uri = getUri(String.format("%s/%s/%s/collections/%s/%s", baseAstraUrl, "v2/namespaces", namespaceId, collectionId, documentId));
        HttpGet request = new HttpGet(uri);
        request.addHeader("X-Cassandra-Request-Id", UUID.randomUUID().toString());
        request.addHeader("X-Cassandra-Token", token);
        request.addHeader("content-type", "application/json");
        request.addHeader("accept", "application/json");
        System.out.println(request.toString());

        try (CloseableHttpResponse response = httpClient.execute(request))
        {
            // Get HttpResponse Status
            System.out.println(response.getStatusLine().toString());

            HttpEntity entity = response.getEntity();
            Header headers = entity.getContentType();
            System.out.println(headers);

            String respContent = IOUtils.toString(entity.getContent(), Charset.defaultCharset());
            JsonNode jsonResult = mapper.readTree(respContent);
            JsonNode docid = jsonResult.get("documentId");
            JsonNode data = jsonResult.get("data");

            Loan loan = mapper.treeToValue(data, Loan.class);
            loan.documentId = documentId;
            return loan;
        }
    }

    private List<Loan> getLoans() throws IOException, URISyntaxException
    {
        // /api/rest/v2/namespaces/{namespace-id}/collections/{collection-id}
        String where = "{\"funded_amount\": { \"$gte\": 0 } }";
        where = "{\"posted_time\": { \"$gte\": \"2000-01-01\" } }";
        String fields = "id,name,funded_amount,funded_time,country_code,country_name,town,lat,lon,location_name,location_type";
//        where = "?where={\"country_code\":{\"$eq\":\"KE\"}}";
//        where = "?where={\"name\":{\"$gte\":\"Joyce\"}}";
        System.out.println("where=" + where);
        System.out.println("fields=" + fields);
        URI uri = getUri(String.format("%s/%s/%s/collections/%s?where=%s&fields=%s", baseAstraUrl, "v2/namespaces", namespaceId, collectionId, where, fields));
        HttpGet request = new HttpGet(uri);
        request.addHeader("X-Cassandra-Request-Id", UUID.randomUUID().toString());
        request.addHeader("X-Cassandra-Token", token);
        request.addHeader("content-type", "application/json");
        request.addHeader("accept", "application/json");
        System.out.println("getLoans: " + request.toString());

        List<Loan> loans = new ArrayList<>();
        try (CloseableHttpResponse response = httpClient.execute(request))
        {
            // Get HttpResponse Status
            System.out.println(response.getStatusLine().toString());
            int responseCode = response.getStatusLine().getStatusCode();
            if (responseCode == 200)
            {
                HttpEntity entity = response.getEntity();
                Header headers = entity.getContentType();
                System.out.println(headers);

                String respContent = IOUtils.toString(entity.getContent(), Charset.defaultCharset());
                JsonNode jsonResult = mapper.readTree(respContent);
                JsonNode data = jsonResult.get("data");
                data.fields().forEachRemaining(entry -> {
                    try
                    {
                        String docId = entry.getKey();
                        JsonNode value = entry.getValue();
                        if (value.isArray()) {
                            System.out.println(String.format("Unexpected array node, size=%d", value.size()));
                            value = value.get(0);
                        }
                        Loan loan = mapper.treeToValue(value, Loan.class);
                        loan.documentId = docId;
                        loans.add(loan);
                    }
                    catch (JsonProcessingException e)
                    {
                        e.printStackTrace();
                    }
                });
            }
            else
            {
                System.out.println("Got response code: " + responseCode);
            }
        }
        System.out.println(String.format("getLoans returning %d loans", loans.size()));
        return loans;
    }

    private String postLoan(Loan l) throws IOException, URISyntaxException
    {
        // /api/rest/v2/namespaces/{namespace-id}/collections/{collection-id}
        URI uri = getUri(String.format("%s/%s/%s/collections/%s", baseAstraUrl, "v2/namespaces", namespaceId, collectionId));
        HttpPost post = new HttpPost(uri);
        post.addHeader("X-Cassandra-Request-Id", UUID.randomUUID().toString());
        post.addHeader("X-Cassandra-Token", token);
        post.addHeader("content-type", "application/json");
        post.addHeader("accept", "application/json");
        System.out.println(post.toString());
        String json = mapper.writeValueAsString(l);
        StringEntity entity = new StringEntity(json);
        post.setEntity(entity);

        String documentId = null;
        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(post))
        {
            System.out.println(response.toString());
            String jsonResponse = EntityUtils.toString(response.getEntity());
            System.out.println("RESP=" + jsonResponse);
            JsonNode jsonNode = mapper.readTree(jsonResponse);
            documentId = jsonNode.get("documentId").asText().trim();
            //RESP={"documentId":"60ee5b38-f731-4b24-b12e-4b0ba662ee52"}
        }
        return documentId;
    }

    private LocationData getLocationData(String locationName) throws Exception
    {
        String baseuri = "https://us1.locationiq.com/v1/search.php?key=d6a843ddb4a697&format=json&q=";
        String urlString = String.format("%s%s", baseuri, locationName);
        URI uri = getUri(urlString);
        HttpGet request = new HttpGet(uri);

        try (CloseableHttpResponse response = httpClient.execute(request))
        {
            // Get HttpResponse Status
            System.out.println(response.getStatusLine().toString());

            HttpEntity entity = response.getEntity();
            Header headers = entity.getContentType();
            System.out.println(headers);

            String respContent = IOUtils.toString(entity.getContent(), Charset.defaultCharset());
            JsonNode jsonResult = mapper.readTree(respContent);
            LocationData locationData = null;
            for (JsonNode jsonNode : jsonResult)
            {
                JsonNode aClass = jsonNode.get("class");
                if (aClass != null)
                {
                    String locationClass = aClass.asText();
                    if ("place".equalsIgnoreCase(locationClass))
                    {
                        String name = jsonNode.get("display_name").asText().trim();
                        String type = jsonNode.get("type").asText().trim();
                        String lat = jsonNode.get("lat").asText().trim();
                        String lon = jsonNode.get("lon").asText().trim();
                        System.out.println(String.format("name: %s, type: %s, lat: %s, lon: %s", name, type, lat, lon));
                        locationData = new LocationData(name, type, lat, lon);
                        break;
                    }
                    else
                    {
//                    System.out.println("location class: " + locationClass);
                    }
                }
            }
            return locationData;
        }
    }

    private boolean deleteLoan(Loan l) throws IOException, URISyntaxException
    {
        if (l.documentId == null || l.documentId.isEmpty())
        {
            System.out.println("Cannot delete loan without a documentId");
            return false;
        }
        // /api/rest/v2/namespaces/{namespace-id}/collections/{collection-id}/{document-id}
        URI uri = getUri(String.format("%s/%s/%s/collections/%s/%s", baseAstraUrl, "v2/namespaces", namespaceId, collectionId, l.documentId));
        HttpDelete delete = new HttpDelete(uri);
        delete.addHeader("X-Cassandra-Request-Id", UUID.randomUUID().toString());
        delete.addHeader("X-Cassandra-Token", token);
        delete.addHeader("content-type", "application/json");
        delete.addHeader("accept", "application/json");
        System.out.println(delete.toString());

        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(delete))
        {
            System.out.println(response.getStatusLine().toString());
            int responseCode = response.getStatusLine().getStatusCode();
            if (responseCode == 200)
            {
                return true;
            }
        }
        return false;
    }

    private URI getUri(String urlString) throws MalformedURLException, URISyntaxException
    {
        URL url = new URL(urlString);
        URI uri = new URI(url.getProtocol(), url.getHost(), url.getPath(), url.getQuery(), null);
        System.out.println(uri);
        return uri;
    }

    private String getAuthToken() throws Exception
    {
        URI uri = getUri(String.format("%s/%s", baseAstraUrl, "v1/auth"));
        HttpPost post = new HttpPost(uri);

        // add request parameter, form parameters
        List<NameValuePair> urlParameters = new ArrayList<>();
        urlParameters.add(new BasicNameValuePair("username", astraDatabaseUser));
        urlParameters.add(new BasicNameValuePair("password", astraDatabasePassword));
        System.out.println(urlParameters);

        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", astraDatabaseUser, astraDatabasePassword);
        StringEntity entity = new StringEntity(json);
        entity.setContentType("application/json");
        post.setEntity(entity);

        String token = null;
        try (CloseableHttpClient httpClient = HttpClients.createDefault();
             CloseableHttpResponse response = httpClient.execute(post))
        {
            String jsonResponse = EntityUtils.toString(response.getEntity());
            JsonNode jsonNode = mapper.readTree(jsonResponse);
            token = jsonNode.get("authToken").asText().trim();
        }
        System.out.println("Auth token= " + token);
        return token;
    }

    private class LocationData
    {
        public String name;
        public String type;
        public String lat;
        public String lon;

        public LocationData(String name, String type, String lat, String lon)
        {
            this.name = name;
            this.type = type;
            this.lat = lat;
            this.lon = lon;
        }
    }
}
