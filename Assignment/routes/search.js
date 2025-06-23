const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateSpamLikelihood(count) {
  if (count > 10) return 'High';
  if (count > 3) return 'Medium';
  if (count > 0) return 'Low';
  return 'None';
}

// Search by name
router.get('/name', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Query is required' });

  const allMatches = await prisma.contact.findMany({
    where: {
      OR: [
        { name: { startsWith: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } }
      ]
    },
    select: { name: true, phone: true }
  });

  const ranked = [...new Map(allMatches.map(item => [item.phone, item])).values()];

  const result = await Promise.all(ranked.map(async (entry) => {
    const spamCount = await prisma.spamReport.count({ where: { phone: entry.phone } });
    return {
      ...entry,
      spamLikelihood: calculateSpamLikelihood(spamCount)
    };
  }));

  res.json(result);
});

// Search by phone
router.get('/phone', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Query is required' });

  const user = await prisma.user.findUnique({ where: { phone: q }, select: { id: true, name: true, phone: true, email: true } });
  const contacts = await prisma.contact.findMany({ where: { phone: q }, select: { name: true, phone: true } });

  const spamCount = await prisma.spamReport.count({ where: { phone: q } });
  const spamLikelihood = calculateSpamLikelihood(spamCount);

  if (user) {
    const isInContact = await prisma.contact.findFirst({
      where: {
        ownerId: user.id,
        phone: req.user.phone
      }
    });
    return res.json({
      name: user.name,
      phone: user.phone,
      email: isInContact ? user.email : null,
      spamLikelihood
    });
  }

  const results = contacts.map(contact => ({
    ...contact,
    spamLikelihood
  }));

  res.json(results);
});

module.exports = router;
