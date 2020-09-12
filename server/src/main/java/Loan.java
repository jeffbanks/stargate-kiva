import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL) // prevents null members from being serialized to json
@JsonIgnoreProperties(ignoreUnknown = true)
public class Loan
{
    @JsonIgnore
    public String documentId;

    @JsonProperty("id")
    public String id;

    @JsonProperty("name")
    public String name;

    @JsonProperty("original_language")
    public String original_language;

    @JsonProperty("original_description")
    public String original_description;

    @JsonProperty("funded_amount")
    public long funded_amount;

    @JsonProperty("loan_amount")
    public long loan_amount;

    @JsonProperty("status")
    public String status;

    @JsonProperty("image_id")
    public String image_id;

    @JsonProperty("video_id")
    public String video_id;

    @JsonProperty("activity")
    public String activity;

    @JsonProperty("sector")
    public String sector;

    @JsonProperty("use")
    public String use;

    @JsonProperty("country_code")
    public String country_code;

    @JsonProperty("country_name")
    public String country_name;

    @JsonProperty("town")
    public String town;

    @JsonProperty("currency_policy")
    public String currency_policy;

    @JsonProperty("currency_exchange_coverage_rate")
    public double currency_exchange_coverage_rate;

    @JsonProperty("currency")
    public String currency;

    @JsonProperty("partner_id")
    public String partner_id;

    @JsonProperty("posted_time")
    public String posted_time;

    @JsonProperty("planned_expiration_time")
    public String planned_expiration_time;

    @JsonProperty("disbursed_time")
    public String disbursed_time;

    @JsonProperty("funded_time")
    public String funded_time;

    @JsonProperty("term_in_months")
    public long term_in_months;

    @JsonProperty("lender_count")
    public long lender_count;

    @JsonProperty("journal_entries_count")
    public long journal_entries_count;

    @JsonProperty("bulk_journal_entries_count")
    public long bulk_journal_entries_count;

    @JsonProperty("tags")
    public List<String> tags;

    @JsonProperty("repayment_interval")
    public String repayment_interval;

    @JsonProperty("distribution_model")
    public String distribution_model;

    @JsonProperty("borrowers")
    public List<Map<String, String>> borrowers;

    @JsonProperty("lat")
    public String lat;

    @JsonProperty("lon")
    public String lon;

    @JsonProperty("location_name")
    public String location_name;

    @JsonProperty("location_type")
    public String location_type;

    @Override
    public String toString()
    {
        return "Loan{" +
                "documentId='" + documentId + '\'' +
                ", id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", funded_amount='" + funded_amount + '\'' +
                ", funded_time='" + funded_time + '\'' +
                ", country_code='" + country_code + '\'' +
                ", country_name='" + country_name + '\'' +
                ", town='" + town + '\'' +
                ", lat='" + lat + '\'' +
                ", lon='" + lon + '\'' +
                ", location_name='" + location_name + '\'' +
                ", location_type='" + location_type + '\'' +
                ", currency_exchange_coverage_rate='" + currency_exchange_coverage_rate + '\'' +
                ", tags='" + tags + '\'' +
                ", borrowers='" + borrowers + '\'' +
                '}';
    }
}
