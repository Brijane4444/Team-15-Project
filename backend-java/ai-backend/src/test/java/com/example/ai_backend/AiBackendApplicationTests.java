package com.example.ai_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;
import org.mockito.Mockito;
import static org.mockito.ArgumentMatchers.anyString;

@SpringBootTest
class AiBackendApplicationTests {

	@Autowired
	private LlmService llmService;

	@TestConfiguration
	static class TestConfig {
		@Bean
		public LlmService llmService() {
			return Mockito.mock(LlmService.class);
		}
	}

	@Test
	void contextLoads() {
		Mockito.when(llmService.ask(anyString())).thenReturn("mocked response");
	}

}
