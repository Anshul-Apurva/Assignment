const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get own profile
router.get('/me', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, phone: true, email: true }
  });
  res.json(user);
});
// Get own contacts
router.get('/contacts', async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { ownerId: req.user.id },
    select: { id: true, name: true, phone: true }
  });
  res.json(contacts);
});

module.exports = router;
