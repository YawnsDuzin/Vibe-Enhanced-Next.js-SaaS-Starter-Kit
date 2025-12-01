import { PrismaClient, PromptCategory, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const systemPrompts = [
  {
    name: 'Professional Email Writer',
    description: 'Generate professional emails for various business scenarios',
    content: `Write a professional email for the following scenario:

Topic: {{topic}}
Tone: {{tone}}
Key Points: {{keyPoints}}

The email should be:
- Clear and concise
- Professional in tone
- Include a proper greeting and sign-off
- Be ready to send with minimal editing`,
    category: PromptCategory.WRITING,
    variables: ['topic', 'tone', 'keyPoints'],
    isPublic: true,
    isSystem: true,
  },
  {
    name: 'Code Review Assistant',
    description: 'Get detailed code reviews with improvement suggestions',
    content: `Review the following code and provide feedback:

Language: {{language}}
Code:
\`\`\`
{{code}}
\`\`\`

Please analyze:
1. Code quality and readability
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Best practices adherence

Provide specific suggestions for improvement.`,
    category: PromptCategory.CODING,
    variables: ['language', 'code'],
    isPublic: true,
    isSystem: true,
  },
  {
    name: 'Marketing Copy Generator',
    description: 'Create compelling marketing copy for products and services',
    content: `Create marketing copy for:

Product/Service: {{productName}}
Target Audience: {{targetAudience}}
Key Benefits: {{benefits}}
Desired Action: {{callToAction}}

Generate:
1. A catchy headline
2. A compelling subheadline
3. 3-4 benefit-focused bullet points
4. A strong call-to-action

Make it persuasive yet authentic.`,
    category: PromptCategory.MARKETING,
    variables: ['productName', 'targetAudience', 'benefits', 'callToAction'],
    isPublic: true,
    isSystem: true,
  },
  {
    name: 'Customer Support Response',
    description: 'Generate helpful customer support responses',
    content: `Help me respond to this customer inquiry:

Customer Message: {{customerMessage}}
Product/Service Context: {{context}}
Tone: {{tone}}

Create a response that:
- Acknowledges the customer's concern
- Provides a clear solution or next steps
- Maintains a {{tone}} tone
- Offers additional help if needed`,
    category: PromptCategory.SUPPORT,
    variables: ['customerMessage', 'context', 'tone'],
    isPublic: true,
    isSystem: true,
  },
  {
    name: 'Sales Pitch Creator',
    description: 'Craft persuasive sales pitches',
    content: `Create a sales pitch for:

Product: {{product}}
Prospect Type: {{prospectType}}
Pain Points: {{painPoints}}
Unique Value: {{uniqueValue}}

Structure the pitch with:
1. Hook that addresses the pain point
2. Solution presentation
3. Key differentiators
4. Social proof placeholder
5. Clear next steps`,
    category: PromptCategory.SALES,
    variables: ['product', 'prospectType', 'painPoints', 'uniqueValue'],
    isPublic: true,
    isSystem: true,
  },
  {
    name: 'API Documentation Generator',
    description: 'Generate API documentation from code or descriptions',
    content: `Generate API documentation for:

Endpoint: {{endpoint}}
Method: {{method}}
Description: {{description}}
Parameters: {{parameters}}
Response Example: {{responseExample}}

Create documentation including:
- Endpoint URL and method
- Description
- Request parameters (query, body, headers)
- Response format with examples
- Error codes and handling
- Usage example with curl`,
    category: PromptCategory.CODING,
    variables: ['endpoint', 'method', 'description', 'parameters', 'responseExample'],
    isPublic: true,
    isSystem: true,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: await bcrypt.hash('demo123', 12),
      role: Role.USER,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create free subscription for demo user
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      plan: 'FREE',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Free subscription created for demo user');

  // Create system prompts
  for (const promptData of systemPrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `system-${promptData.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {
        ...promptData,
        variables: promptData.variables,
      },
      create: {
        id: `system-${promptData.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...promptData,
        variables: promptData.variables,
      },
    });
  }

  console.log(`✅ ${systemPrompts.length} system prompts created`);

  // Create a demo team
  const demoTeam = await prisma.team.upsert({
    where: { slug: 'demo-team' },
    update: {},
    create: {
      name: 'Demo Team',
      slug: 'demo-team',
      description: 'A demo team for testing',
      ownerId: demoUser.id,
    },
  });

  // Add demo user as team member
  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: demoTeam.id,
        userId: demoUser.id,
      },
    },
    update: {},
    create: {
      teamId: demoTeam.id,
      userId: demoUser.id,
      role: 'OWNER',
    },
  });

  console.log('✅ Demo team created');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
