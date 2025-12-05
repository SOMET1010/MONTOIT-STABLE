// Test script pour vérifier l'API Brevo SMS
const brevoApiKey = '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';

const sendSMS = async () => {
  try {
    console.log('Envoi du SMS de test...');

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: 'MonToit',
        recipient: '+2250140984943',
        content: 'Votre code de verification Mon Toit est: 123456. Valable 10 minutes.',
        type: 'transactional',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur HTTP:', response.status, response.statusText);
      console.error('Détails erreur:', data);
      return;
    }

    console.log('SMS envoyé avec succès!');
    console.log('Réponse:', data);

  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
  }
};

sendSMS();