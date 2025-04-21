package com.jacksonmdavis.analyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/// Student Performance Data Analyzer - Spring Boot Backend Application
/// This Spring Boot application serves as a backend gateway that:
/// - Accepts CSV file uploads from the frontend
/// - Forwards requests to a Python microservice for data analysis
/// - Returns analysis results back to the frontend
/// The application acts as an intermediary between the frontend client
/// and the Python analysis service, handling cross-origin requests and
/// file upload processing.
@SpringBootApplication
public class AnalyzerApp {

    public static void main(String[] args) {
        SpringApplication.run(AnalyzerApp.class, args);
    }
}
