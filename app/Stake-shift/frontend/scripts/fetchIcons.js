const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function fetchAndConvertIcon(validatorName) {
  try {
    const formattedName = validatorName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
    const url = `https://solanabeach.io/validator-avatars/${formattedName}.png`;
    console.log(`Fetching icon for ${validatorName} from ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error(`Failed to fetch icon for ${validatorName}:`, error);
    return null;
  }
}

async function getAllIcons() {
  const validators = [
    'Everstake',
    'Chorus One',
    'P2P.ORG',
    'Figment',
    'Staking Facilities',
    'Certus One',
    'Blockdaemon',
    'Staked.us',
    'Shinobi Systems',
    'Chainflow'
  ];

  const icons = {};
  for (const validator of validators) {
    const base64Icon = await fetchAndConvertIcon(validator);
    if (base64Icon) {
      console.log(`Successfully fetched icon for ${validator}`);
      icons[validator] = base64Icon;
    }
  }

  // Write the result to a file
  const outputPath = path.join(__dirname, '../src/assets/validator-icons/icons.ts');
  const fileContent = `
// Auto-generated validator icons
export const validatorIcons = ${JSON.stringify(icons, null, 2)} as const;
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log('Icons saved to:', outputPath);
}

getAllIcons().catch(console.error); 