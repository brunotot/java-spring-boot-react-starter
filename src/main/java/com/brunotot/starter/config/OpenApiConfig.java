package com.brunotot.starter.config;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;

@Configuration
@SecurityScheme(name = "cookieAuth", type = SecuritySchemeType.APIKEY, in = SecuritySchemeIn.COOKIE, paramName = "JSESSIONID")
public class OpenApiConfig {

    @Bean
    OpenAPI starterOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Starter API")
                        .version("v1")
                        .description("REST API documentation for the Starter project")
                        .contact(new Contact()
                                .name("Starter Team")
                                .email("starter@example.com")));
    }

    @Bean
    OpenApiCustomizer globalErrorResponseCustomizer() {
        return openApi -> {
            if (openApi.getPaths() != null) {
                openApi.getPaths().forEach((path, pathItem) -> {
                    if (pathItem.getGet() != null) {
                        addErrorResponse(pathItem.getGet());
                    }
                    if (pathItem.getPost() != null) {
                        addErrorResponse(pathItem.getPost());
                    }
                    if (pathItem.getPut() != null) {
                        addErrorResponse(pathItem.getPut());
                    }
                    if (pathItem.getDelete() != null) {
                        addErrorResponse(pathItem.getDelete());
                    }
                    if (pathItem.getPatch() != null) {
                        addErrorResponse(pathItem.getPatch());
                    }
                });
            }
        };
    }

    private void addErrorResponse(io.swagger.v3.oas.models.Operation operation) {
        if (operation.getResponses() == null) {
            return;
        }

        // Remove individual error responses
        operation.getResponses().remove("400");
        operation.getResponses().remove("401");
        operation.getResponses().remove("403");
        operation.getResponses().remove("404");
        operation.getResponses().remove("500");

        Schema<?> errorSchema = new Schema<>()
                .type("object")
                .addProperty("status", new Schema<>().type("integer").example(400))
                .addProperty("message", new Schema<>().type("string").example("Error occurred"))
                .addProperty("errors",
                        new Schema<>().type("object").additionalProperties(new Schema<>().type("string"))
                                .example(new java.util.LinkedHashMap<>()).nullable(true))
                .addProperty("timestamp", new Schema<>().type("string").example("2026-06-25T12:34:56Z"));

        ApiResponse errorResponse = new ApiResponse()
                .description("ERROR")
                .content(new Content()
                        .addMediaType("application/json",
                                new MediaType().schema(errorSchema)));

        operation.getResponses().put("4XX / 5XX", errorResponse);
    }
}
