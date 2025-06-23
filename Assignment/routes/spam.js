const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/mark', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone is required' });

  await prisma.spamReport.create({
    data: {
      reporterId: req.user.id,
      phone
    }
  });

  res.json({ message: 'Marked as spam' });
});

module.exports = router;
