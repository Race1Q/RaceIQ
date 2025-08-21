import React from 'react';

interface F1LoadingSpinnerProps {
  text: string;
}

const F1LoadingSpinner: React.FC<F1LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="loading-container">
      <div className="loading-text">{text}</div>
      <div className="speedometer">
        <div className="speedometer-dial">
          <div className="speedometer-needle"></div>
          <div className="speedometer-markings">
            <div className="speedometer-marking major"></div>
            <div className="speedometer-marking"></div>
            <div className="speedometer-marking"></div>
            <div className="speedometer-marking major"></div>
            <div className="speedometer-marking"></div>
            <div className="speedometer-marking"></div>
            <div className="speedometer-marking major"></div>
          </div>
          <div className="speedometer-numbers">
            <div className="speedometer-number">0</div>
            <div className="speedometer-number">50</div>
            <div className="speedometer-number">100</div>
            <div className="speedometer-number">150</div>
            <div className="speedometer-number">200</div>
            <div className="speedometer-number">250</div>
            <div className="speedometer-number">300</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default F1LoadingSpinner;
