import { type ApiCountry } from "@/features/country/api/country";
import { Country as CountrySchema, type Country as CountryModel } from "@/features/country/models/Country";
import { type CountryFilters } from "@/features/country/models/CountryFilters";
import { AxiosClient } from "@/infrastructure/browser";
import { type PageableParams, type PageableResponse } from "@rgo/front-ui";

class ApiCountryOnline extends AxiosClient implements ApiCountry {
  constructor() {
    super("country");
  }

  async find(pageable: PageableParams, filters: CountryFilters): Promise<PageableResponse<CountryModel>> {
    return await this.httpGetPageable(CountrySchema)("", pageable, {
      params: {
        sortBy: "code",
        sortDirection: "asc",
        searchText: filters.searchText,
      },
    });
  }

  async update(country: CountryModel): Promise<CountryModel> {
    return await this.httpPut(CountrySchema)("", country);
  }
}

export const Country = new ApiCountryOnline();
