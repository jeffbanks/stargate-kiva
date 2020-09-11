import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL) // prevents null members from being serialized to json
@JsonIgnoreProperties(ignoreUnknown = true)
public class Loan
{
    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    // TODO; Add more fields

    @Override
    public String toString()
    {
        return "Loan{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
