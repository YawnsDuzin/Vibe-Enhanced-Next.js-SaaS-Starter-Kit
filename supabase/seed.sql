-- Vibe SaaS Starter Kit - Seed Data
-- Run this after the initial schema migration

-- ===========================================
-- System Prompts
-- ===========================================

INSERT INTO prompts (id, name, description, content, category, variables, is_public, is_system, usage_count)
VALUES
    (
        'system-professional-email-writer',
        'Professional Email Writer',
        'Generate professional emails for various business scenarios',
        E'Write a professional email for the following scenario:\n\nTopic: {{topic}}\nTone: {{tone}}\nKey Points: {{keyPoints}}\n\nThe email should be:\n- Clear and concise\n- Professional in tone\n- Include a proper greeting and sign-off\n- Be ready to send with minimal editing',
        'WRITING',
        '["topic", "tone", "keyPoints"]',
        TRUE,
        TRUE,
        0
    ),
    (
        'system-code-review-assistant',
        'Code Review Assistant',
        'Get detailed code reviews with improvement suggestions',
        E'Review the following code and provide feedback:\n\nLanguage: {{language}}\nCode:\n```\n{{code}}\n```\n\nPlease analyze:\n1. Code quality and readability\n2. Potential bugs or issues\n3. Performance considerations\n4. Security concerns\n5. Best practices adherence\n\nProvide specific suggestions for improvement.',
        'CODING',
        '["language", "code"]',
        TRUE,
        TRUE,
        0
    ),
    (
        'system-marketing-copy-generator',
        'Marketing Copy Generator',
        'Create compelling marketing copy for products and services',
        E'Create marketing copy for:\n\nProduct/Service: {{productName}}\nTarget Audience: {{targetAudience}}\nKey Benefits: {{benefits}}\nDesired Action: {{callToAction}}\n\nGenerate:\n1. A catchy headline\n2. A compelling subheadline\n3. 3-4 benefit-focused bullet points\n4. A strong call-to-action\n\nMake it persuasive yet authentic.',
        'MARKETING',
        '["productName", "targetAudience", "benefits", "callToAction"]',
        TRUE,
        TRUE,
        0
    ),
    (
        'system-customer-support-response',
        'Customer Support Response',
        'Generate helpful customer support responses',
        E'Help me respond to this customer inquiry:\n\nCustomer Message: {{customerMessage}}\nProduct/Service Context: {{context}}\nTone: {{tone}}\n\nCreate a response that:\n- Acknowledges the customer''s concern\n- Provides a clear solution or next steps\n- Maintains a {{tone}} tone\n- Offers additional help if needed',
        'SUPPORT',
        '["customerMessage", "context", "tone"]',
        TRUE,
        TRUE,
        0
    ),
    (
        'system-sales-pitch-creator',
        'Sales Pitch Creator',
        'Craft persuasive sales pitches',
        E'Create a sales pitch for:\n\nProduct: {{product}}\nProspect Type: {{prospectType}}\nPain Points: {{painPoints}}\nUnique Value: {{uniqueValue}}\n\nStructure the pitch with:\n1. Hook that addresses the pain point\n2. Solution presentation\n3. Key differentiators\n4. Social proof placeholder\n5. Clear next steps',
        'SALES',
        '["product", "prospectType", "painPoints", "uniqueValue"]',
        TRUE,
        TRUE,
        0
    ),
    (
        'system-api-documentation-generator',
        'API Documentation Generator',
        'Generate API documentation from code or descriptions',
        E'Generate API documentation for:\n\nEndpoint: {{endpoint}}\nMethod: {{method}}\nDescription: {{description}}\nParameters: {{parameters}}\nResponse Example: {{responseExample}}\n\nCreate documentation including:\n- Endpoint URL and method\n- Description\n- Request parameters (query, body, headers)\n- Response format with examples\n- Error codes and handling\n- Usage example with curl',
        'CODING',
        '["endpoint", "method", "description", "parameters", "responseExample"]',
        TRUE,
        TRUE,
        0
    );

-- Note: Admin and demo users should be created through Supabase Auth
-- Use the Supabase Dashboard or Auth API to create users
