const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../학원용앱/src/components/InquiryGuide.tsx');
let content = fs.readFileSync(target, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Check line 63-105:
// We added:
// <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   <button ...>...</button>
//   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' ... }}>
//   ...
//   </div>
// We need another </div> to close <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>!

const targetBlock = `            )}
          </div>
        </div>
        
        <div className="guide-tabs">`;

const replacementBlock = `            )}
          </div>
          </div>
        </div>
        
        <div className="guide-tabs">`;

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replacementBlock);
}

// 2. Ensure ConsultantGuideModal is rendered inside the component
if (!content.includes('<ConsultantGuideModal')) {
  const modalTarget = `      )}
    </div>
  );
};`;

  const modalReplacement = `      )}
      <ConsultantGuideModal isOpen={isGuideBookModalOpen} onClose={() => setIsGuideBookModalOpen(false)} />
    </div>
  );
};`;
  content = content.replace(modalTarget, modalReplacement);
}

fs.writeFileSync(target, content, 'utf8');
console.log('InquiryGuide fixed successfully');
