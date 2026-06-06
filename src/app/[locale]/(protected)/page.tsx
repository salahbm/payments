import { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <div className="pb-8">
      <h1 className="typo-header">Transactions</h1>
      <p className="typo-body-1 text-muted-foreground">
        Review merchant payment history across Sandbox and Production.
      </p>
    </div>
  );
};

export default HomePage;
