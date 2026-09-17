const mongoose = require('mongoose');
const Role = require('../models/role'); // Ensure this path is correct
const User = require('../models/user'); // Add User model import
const EncryptionService = require('../utils/encryption');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected:', conn.connection.host);

    // Run this for first time setup only
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Administrator role with full access',
        permissions: ['all']
      },
      {
        name: 'sub-admin',
        description: 'Sub-administrator role with limited access',
        permissions: ['all']
      },
      {
        name: 'user',
        description: 'Standard user role',
      },
      {
        name: 'QA',
        description: 'Standard QA role',
        permissions: ['Projects', 'Task Dashboard', 'Users', 'Technology']
      },
      {
        name: 'Support',
        description: 'Standard Support role',
        permissions: ['Tickets']
      },
      {
        name: 'Marketing',
        description: 'Marketing',
        permissions: ['Projects + Tasks']
      },
      {
        name: 'Freelancers',
        description: 'Marketing',
        permissions: ['Projects + Tasks']
      },
      {
        name: 'Project Manager',
        description: 'Project Manager role with project, milestone and task management',
        permissions: ['Projects', 'Task Dashboard', 'Clients']
      },
      {
        name: 'Client',
        description: 'Client',
        permissions: []
      }
    ];

    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.info(`Created default role: ${role.name}`);
      }
    }


    const adminRole = await Role.findOne({ name: 'admin' });
    const adminUser = await User.findOne({ role: adminRole._id });

    if (!adminUser && adminRole) {
      await User.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        contact: '0000000000',
        password: EncryptionService.encrypt(process.env.ADMIN_PASSWORD),
        role: adminRole._id,
        designation: 'CEO'
      });
      console.info('Created default admin user');
    }
    await addTechCategories();
    await addTechnology();

  } catch (error) {
    console.log(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

const addTechCategories = async () => {
  const TechnologyCategory = require('../models/technology').TechnologyCategory;

  const technologyCategories = [
    {
      name: "Frontend Development",
      description: "Technologies used for developing user interfaces.",
    },
    {
      name: "Backend Development",
      description: "Technologies for server-side logic and APIs.",
    },
    {
      name: "UI Design",
      description: "Styling and component-based UI libraries and frameworks.",
    },
    {
      name: "Mobile Development",
      description: "Frameworks for building mobile applications.",
    },
    {
      name: "DevOps & Deployment",
      description: "Tools for deployment, CI/CD, and cloud services.",
    },
    {
      name: "Database",
      description: "Database systems for data storage and management.",
    },
    {
      name: "Testing & QA",
      description: "Tools for software testing, automation, and quality assurance.",
    },
    {
      name: "Languages",
      description: "Programming languages used across various stacks.",
    }
  ];

  for (const category of technologyCategories) {
    const existingCategory = await TechnologyCategory.findOne({ name: category.name });
    if (!existingCategory) {
      await TechnologyCategory.create(category);
      console.info(`Created technology category: ${category.name}`);
    }
  }
};

const addTechnology = async () => {
  const Technology = require('../models/technology').Technology;
  const TechnologyCategory = require('../models/technology').TechnologyCategory;
  const categories = await TechnologyCategory.find({}).select('_id name');
  const technologies = [
    // Frontend Development
    { name: "React", description: "A JavaScript library for building user interfaces.", category: categories.find(c => c.name === "Frontend Development")?._id },
    { name: "Angular", description: "A TypeScript-based frontend framework by Google.", category: categories.find(c => c.name === "Frontend Development")?._id },
    { name: "Next.js", description: "A React framework with SSR and SSG capabilities.", category: categories.find(c => c.name === "Frontend Development")?._id },

    // Backend Development
    { name: "Express.js", description: "A minimal Node.js web application framework.", category: categories.find(c => c.name === "Backend Development")?._id },
    { name: "NestJS", description: "A Node.js backend framework with TypeScript support.", category: categories.find(c => c.name === "Backend Development")?._id },
    { name: "Node.js", description: "A runtime to execute JavaScript on the server.", category: categories.find(c => c.name === "Backend Development")?._id },
    { name: "Django", description: "A high-level Python Web framework.", category: categories.find(c => c.name === "Backend Development")?._id },

    // UI Design
    { name: "HTML", description: "Markup language for web pages.", category: categories.find(c => c.name === "UI Design")?._id },
    { name: "CSS", description: "Style sheet language used to style HTML.", category: categories.find(c => c.name === "UI Design")?._id },
    { name: "SASS", description: "A CSS preprocessor for cleaner code.", category: categories.find(c => c.name === "UI Design")?._id },
    { name: "Bootstrap", description: "A CSS framework for responsive UI.", category: categories.find(c => c.name === "UI Design")?._id },
    { name: "Tailwind CSS", description: "A utility-first CSS framework.", category: categories.find(c => c.name === "UI Design")?._id },
    { name: "WordPress", description: "A CMS platform used for website building.", category: categories.find(c => c.name === "UI Design")?._id },

    // Mobile Development
    { name: "React Native", description: "React framework for building native mobile apps.", category: categories.find(c => c.name === "Mobile Development")?._id },
    { name: "Flutter", description: "UI toolkit by Google for building natively compiled apps.", category: categories.find(c => c.name === "Mobile Development")?._id },

    // DevOps & Deployment
    { name: "AWS", description: "Amazon Web Services for cloud deployment.", category: categories.find(c => c.name === "DevOps & Deployment")?._id },
    { name: "Google Cloud", description: "Cloud computing services by Google.", category: categories.find(c => c.name === "DevOps & Deployment")?._id },
    { name: "CI/CD Pipeline", description: "Continuous Integration and Deployment tools.", category: categories.find(c => c.name === "DevOps & Deployment")?._id },
    { name: "Vercel", description: "Frontend deployment platform for Next.js.", category: categories.find(c => c.name === "DevOps & Deployment")?._id },
    { name: "Netlify", description: "Hosting platform for static and JAMstack sites.", category: categories.find(c => c.name === "DevOps & Deployment")?._id },

    // Database
    { name: "MongoDB", description: "A NoSQL document database.", category: categories.find(c => c.name === "Database")?._id },
    { name: "SQL", description: "Structured Query Language for relational databases.", category: categories.find(c => c.name === "Database")?._id },
    { name: "PostgreSQL", description: "An advanced open-source SQL database.", category: categories.find(c => c.name === "Database")?._id },

    // Testing & QA
    { name: "Automation Testing", description: "Using tools to automate test cases.", category: categories.find(c => c.name === "Testing & QA")?._id },
    { name: "Quality Analysis", description: "Ensuring product quality through testing.", category: categories.find(c => c.name === "Testing & QA")?._id },
    { name: "Negative Testing", description: "Testing invalid scenarios to find bugs.", category: categories.find(c => c.name === "Testing & QA")?._id },

    // Languages
    { name: "JavaScript", description: "A scripting language for web development.", category: categories.find(c => c.name === "Languages")?._id },
    { name: "TypeScript", description: "Typed superset of JavaScript.", category: categories.find(c => c.name === "Languages")?._id },
    { name: "Python", description: "General-purpose programming language.", category: categories.find(c => c.name === "Languages")?._id }
  ];

  // Fixed for loop syntax and variable references
  for (const technology of technologies) {
    const existing = await Technology.findOne({ name: technology.name });
    if (!existing) {
      await Technology.create(technology);
      console.info(`Created technology: ${technology.name}`);
    }
  }
}

module.exports = connectDB;
