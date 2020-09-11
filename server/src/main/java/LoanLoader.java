import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class LoanLoader
{
    public LoanLoader()
    {
    }

    public static void main(String[] args) throws IOException
    {
        LoanLoader loanLoader = new LoanLoader();
        loanLoader.load();
    }

    private void load() throws IOException
    {
        File loanFile = new File("/Users/dan.jatnieks/Downloads/kiva_ds_json/loans.json");
        ObjectMapper mapper = new ObjectMapper();

        JsonFactory factory = mapper.getFactory();
        JsonParser parser = factory.createParser(loanFile);

        TypeReference<List<Loan>> tRef = new TypeReference<List<Loan>>() {
        };
        List<Loan> loans = mapper.readValue(parser, tRef);
        System.out.println(String.format("There are %d loans", loans.size()));

        loans.stream().limit(10).forEach(System.out::println);
    }
}
