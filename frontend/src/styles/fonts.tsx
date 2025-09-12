// frontend/src/Fonts.tsx

import { Global } from '@emotion/react';

const Fonts = () => (
  <Global
    styles={`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Exo+2:wght@300;600&family=Damion&display=swap');
    `}
  />
);

export default Fonts;