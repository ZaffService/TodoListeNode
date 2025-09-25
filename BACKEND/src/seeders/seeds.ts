import dotenv from 'dotenv';
dotenv.config();

import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  try {
    process.stdout.write("🚀 Seeding database...\n");
    process.stdout.write("Hashing password...\n");
    const passwordHash = await bcrypt.hash("password123", 10);
    process.stdout.write("Password hashed: " + passwordHash.substring(0, 10) + "...\n");

    // Créer d'abord les utilisateurs
    const utilisateur1 = await prisma.user.upsert({
      where: { login: "moustapha" },
      update: {
        nom: "Moustapha Seck",
        password: passwordHash
      },
      create: {
        nom: "Moustapha Seck",
        login: "moustapha",
        password: passwordHash
      }
    });

    process.stdout.write("✅ Utilisateur 1 créé/mis à jour: " + utilisateur1.id + "\n");

    const utilisateur2 = await prisma.user.upsert({
      where: { login: "zafe" },
      update: {
        nom: "Zafe",
        password: passwordHash
      },
      create: {
        nom: "Zafe",
        login: "zafe",
        password: passwordHash
      }
    });

    process.stdout.write("✅ Utilisateur 2 créé/mis à jour: " + utilisateur2.id + "\n");

    // Ensuite créer les tâches avec les bons IDs d'utilisateurs
    const tache1 = await prisma.taches.create({
      data: {
        description: "Première tâche importante",
        etat: "En_Cours",
        userId: utilisateur1.id
      }
    });

    const tache2 = await prisma.taches.create({
      data: {
        description: "Deuxième tâche importante",
        etat: "En_Cours",
        userId: utilisateur2.id
      }
    });

    process.stdout.write("✅ Seeding terminé avec succès !\n");
  } catch (error) {
    const err = error as Error;
    process.stderr.write("❌ Erreur lors du seeding: " + err.message + "\n");
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur de seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
