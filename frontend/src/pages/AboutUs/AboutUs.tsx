import styles from './AboutUs.module.css';

export default function AboutUs() {
  return (
    <div className={styles.aboutContainer}>
      <h1>About RaceIQ</h1>
      <p>
        RaceIQ is your go-to F1 stats tracker. Our mission is to provide fans 
        with real-time race data, historical stats, and deep insights into 
        every driver and team.
      </p>
      <p>
        Whether you're following your favorite driver or analyzing team 
        performance, RaceIQ keeps you in the fast lane of F1 knowledge.
      </p>
    </div>
  );
}
