import { useState } from 'react';
import './App.css';
import { Card, CardContent, TextField, Button, Alert, Backdrop, CircularProgress } from '@mui/material';
import Turnstile from 'react-turnstile';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

/**
 * The app component contains a form for the user to sheck the VAT number.
 * The form contains an input field for the VAT number and a submit button.
 * The app uses EU VIES API to check the VAT number.
 * The app displays the result of the check.
 * The result contains the name and address of the company.
 */
function App() {
  const [vatNumber, setVatNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  /**
   * Sanitize the VAT number. Allowing only numbers and uppercase letters.
   * Removing spaces, dots, dashes, and other special characters.
   * @param {*} vatNumber
   * @returns
   */
  const sanitizeVatNumber = (vatNumber) => {
    return vatNumber.replace(/[^A-Z0-9]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult({});

    const args = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode: 'fi',
        vatNumber: sanitizeVatNumber(vatNumber),
      }),
    };

    const response = await fetch('/wp-json/vat/validate', args);
    const data = await response.json();
    setResult(JSON.parse(data));
    setLoading(false);
  };

  return (
    <div className='App'>
      <Card>
        <CardContent>
          <div className='App-header'>
            <h4>Tarkista yrityksen Y-tunnus/ALV-numero</h4>
            <p>Kokeile VIES-järjestelmää. Kirjoita kenttään suomalaisen yrityksen Y-tunnus tai AVL-numero.</p>
          </div>

          {result?.name && result?.valid && (
            <Alert severity='success' variant='outlined'>
              {result.name}
            </Alert>
          )}

          {result !== null && !loading && !result?.valid && (
            <Alert severity='error' variant='outlined'>
              Yritystä ei löytynyt
            </Alert>
          )}

          <TextField
            required
            id='outlined-required'
            label='Y-tunnus/ALV-numero'
            placeholder='Syötä Y-tunnus/ALV-numero'
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
          />

          <Button
            variant='contained'
            size='large'
            type='submit'
            disabled={token === '' || vatNumber.length < 8}
            onClick={handleSubmit}
          >
            Tarkista
          </Button>

          <Turnstile
            className='tunrstile-container'
            sitekey='0x4AAAAAAA90YXNCF4DE_ZHk'
            theme='light'
            onVerify={(token) => {
              setToken(token);
            }}
            onExpire={() => {
              setToken('');
            }}
          />
        </CardContent>
      </Card>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  );
}

export default App;
