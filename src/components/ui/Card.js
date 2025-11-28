import clsx from 'clsx';

export default function Card({ children, variant = 'default', className }) {
  return (
    <section className={clsx('card', `card--${variant}`, className)}>
      {children}
    </section>
  );
}

