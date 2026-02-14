// @ts-ignore
import logo from '/logo.png';
import type { JSX } from 'react';

type StartProps = {
  setIntro: (intro: boolean) => void;
};

export function Start({ setIntro }: StartProps): JSX.Element {
  return (
    <div className='view start'>
      <div className='form-control-wrapper'>
        <img src={logo} alt='logo' width='300' height='300' />
        <button className='form-control' onClick={() => setIntro(false)}>
          Start
        </button>
      </div>
    </div>
  );
}
