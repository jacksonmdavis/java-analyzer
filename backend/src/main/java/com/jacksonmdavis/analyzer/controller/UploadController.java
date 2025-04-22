package com.jacksonmdavis.analyzer.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;
import java.util.Map;

/**
 * Controller handling file upload operations for student performance analysis.
 * 
 * This controller provides a REST endpoint that:
 * 1. Accepts CSV file uploads from the frontend
 * 2. Forwards the file to a Python microservice for analysis
 * 3. Returns the analysis results to the client
 */

@RestController
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class UploadController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PYTHON_SERVICE_URL = "http://analyzer:5000/upload";

    /**
     * Handles file upload requests for student performance analysis.
     * 
     * @param file The CSV file containing student performance data
     * @return ResponseEntity containing the analysis results or error message
     * 
     * Expected Request:
     * - POST /upload
     * - Content-Type: multipart/form-data
     * - Body: file=@StudentsPerformance.csv
     * 
     * Response Format:
     * {
     *   "message": "File processed successfully!",
     *   "filename": "StudentsPerformance.csv",
     *   "results": {
     *     "overall": {
     *       "data": { scores... },
     *       "image": "base64..."
     *     },
     *     "columns": [
     *       {
     *         "column_name": {
     *           "data": { scores... },
     *           "image": "base64..."
     *         }
     *       }
     *     ]
     *   }
     * }
     */

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Create MultiValueMap to hold the file data
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Create the request entity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Forward the request to the Python microservice
            ResponseEntity<String> response = restTemplate.exchange(
                    PYTHON_SERVICE_URL,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/upload-stream")
    public ResponseBodyEmitter uploadWithProgress(@RequestParam("file") MultipartFile file) {
        ResponseBodyEmitter emitter = new ResponseBodyEmitter();

        new Thread(() -> {
            try {
                emitter.send(Map.of("type", "log", "message", "1. Uploading file to backend API..."), MediaType.APPLICATION_JSON);
                emitter.send("\n", MediaType.TEXT_PLAIN);

                // Prepare the file
                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("file", new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                });

                emitter.send(Map.of("type", "log", "message", "2. File received. Preparing to forward to Python service..."), MediaType.APPLICATION_JSON);
                emitter.send("\n", MediaType.TEXT_PLAIN);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);
                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                emitter.send(Map.of("type", "log", "message", "3. Forwarding file to Python microservice..."), MediaType.APPLICATION_JSON);
                emitter.send("\n", MediaType.TEXT_PLAIN);

                // Call Python microservice
                ResponseEntity<String> response = restTemplate.exchange(
                        PYTHON_SERVICE_URL,
                        HttpMethod.POST,
                        requestEntity,
                        String.class
                );

                emitter.send(Map.of("type", "log", "message", "4. Analysis complete. Processing results..."), MediaType.APPLICATION_JSON);
                emitter.send("\n", MediaType.TEXT_PLAIN);

                emitter.send(Map.of("type", "result", "data", response.getBody()), MediaType.APPLICATION_JSON);
                emitter.send("\n", MediaType.TEXT_PLAIN);

                emitter.send(Map.of("type", "log", "message", "6. Program Complete."), MediaType.APPLICATION_JSON);
                emitter.send("\n", MediaType.TEXT_PLAIN);

                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.send(Map.of("type", "log", "message", "Error occurred: " + e.getMessage()), MediaType.APPLICATION_JSON);
                    emitter.send("\n", MediaType.TEXT_PLAIN);
                } catch (Exception ignored) {}
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

}
