import React from 'react';
import { colors, fonts } from '../theme';

export default function Footer() {
  return (
    <footer style={{ background: colors.accent, padding: '2rem 0', textAlign: 'center', marginTop: '4rem' }}>
      <div style={{ fontFamily: fonts.heading, fontStyle: 'italic', color: colors.quote, fontSize: '1.1rem', borderTop: '1px solid #B3D9F2', borderBottom: '1px solid #B3D9F2', padding: '1rem 0' }}>
        Dong Reggie&apos;s Brewery — where every sip tells a story.
      </div>
    </footer>
  );
}
