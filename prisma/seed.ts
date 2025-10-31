import { PrismaClient, UserRole, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed database with initial data
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data cleared\n');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create Users
  console.log('👥 Creating users...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      locale: 'fr',
      isActive: true,
    },
  });
  console.log(`  ✓ Created admin: ${admin.email}`);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: hashedPassword,
      role: UserRole.MANAGER,
      locale: 'fr',
      isActive: true,
    },
  });
  console.log(`  ✓ Created manager: ${manager.email}`);

  const member1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Dupont',
      password: hashedPassword,
      role: UserRole.MEMBER,
      locale: 'fr',
      isActive: true,
    },
  });
  console.log(`  ✓ Created member: ${member1.email}`);

  const member2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Martin',
      password: hashedPassword,
      role: UserRole.MEMBER,
      locale: 'en',
      isActive: true,
    },
  });
  console.log(`  ✓ Created member: ${member2.email}`);

  const member3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Dubois',
      password: hashedPassword,
      role: UserRole.MEMBER,
      locale: 'fr',
      isActive: false, // Inactive user for testing
    },
  });
  console.log(`  ✓ Created inactive member: ${member3.email}\n`);

  // Create Tasks
  console.log('📋 Creating tasks...');

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Tasks with "To Do" status
  await prisma.task.create({
    data: {
      title: "Implémenter l'authentification",
      description:
        "Mettre en place le système d'authentification avec sessions PostgreSQL et bcrypt.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      creatorId: admin.id,
      assigneeId: member1.id,
      dueDate: nextWeek,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Créer le design system',
      description: 'Définir les composants UI réutilisables avec le style glassmorphism.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      creatorId: manager.id,
      assigneeId: member2.id,
      dueDate: nextWeek,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Configuration CI/CD',
      description: 'Mettre en place les pipelines GitHub Actions pour les tests et le déploiement.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      creatorId: admin.id,
      assigneeId: null, // Unassigned
      dueDate: null,
    },
  });

  // IN_PROGRESS Tasks
  await prisma.task.create({
    data: {
      title: 'Intégration HTMX pour les mises à jour partielles',
      description: 'Implémenter les patterns HTMX pour les filtres et la pagination des tâches.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      creatorId: manager.id,
      assigneeId: member1.id,
      dueDate: tomorrow,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Tests E2E avec Playwright',
      description: 'Écrire les tests end-to-end pour les parcours utilisateur critiques.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      creatorId: admin.id,
      assigneeId: member2.id,
      dueDate: nextWeek,
    },
  });

  // DONE Tasks
  await prisma.task.create({
    data: {
      title: 'Setup du projet',
      description:
        'Initialisation du projet avec TypeScript, Express, Prisma et configuration Docker.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      creatorId: admin.id,
      assigneeId: admin.id,
      dueDate: yesterday,
      completedAt: new Date(),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Documentation Architecture',
      description: "Rédiger les ADRs et la documentation d'architecture du projet.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      creatorId: manager.id,
      assigneeId: manager.id,
      dueDate: yesterday,
      completedAt: new Date(),
    },
  });

  // URGENT overdue task
  await prisma.task.create({
    data: {
      title: 'Corriger la faille de sécurité',
      description: 'Corriger la vulnérabilité détectée dans la gestion des sessions.',
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      creatorId: admin.id,
      assigneeId: member1.id,
      dueDate: yesterday, // Overdue!
    },
  });

  // CANCELLED Task
  await prisma.task.create({
    data: {
      title: 'Migration vers MongoDB',
      description: 'Après discussion, nous restons sur PostgreSQL.',
      status: TaskStatus.CANCELLED,
      priority: TaskPriority.LOW,
      creatorId: manager.id,
      assigneeId: null,
      dueDate: null,
    },
  });

  // Some unassigned tasks
  await prisma.task.create({
    data: {
      title: 'Optimisation des performances',
      description: 'Analyser et optimiser les requêtes lentes de la base de données.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      creatorId: admin.id,
      assigneeId: null,
      dueDate: nextWeek,
    },
  });

  console.log('✅ Created 10 tasks with various statuses\n');

  // Display summary
  const userCount = await prisma.user.count();
  const taskCount = await prisma.task.count();
  const todoCount = await prisma.task.count({ where: { status: TaskStatus.TODO } });
  const inProgressCount = await prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } });
  const doneCount = await prisma.task.count({ where: { status: TaskStatus.DONE } });

  console.log('📊 Seeding Summary:');
  console.log(`  👥 Users: ${userCount} (1 admin, 1 manager, 3 members)`);
  console.log(`  📋 Tasks: ${taskCount}`);
  console.log(`    - TODO: ${todoCount}`);
  console.log(`    - IN_PROGRESS: ${inProgressCount}`);
  console.log(`    - DONE: ${doneCount}`);
  console.log('\n✨ Database seeding completed successfully!');
  console.log('\n🔐 Test Credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
}

// Execute seed with top-level await
try {
  await seed();
} catch (error) {
  console.error('❌ Error during seeding:', error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
