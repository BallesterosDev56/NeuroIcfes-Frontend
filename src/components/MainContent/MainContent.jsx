
import PracticeSection from './PracticeSection';
import PreferencesSection from './PreferencesSection';
import SettingsSection from './SettingsSection';
import LogoutSection from './LogoutSection';

const MainContent = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'practice':
        return <PracticeSection />;
      case 'preferences':
        return <PreferencesSection />;
      case 'settings':
        return <SettingsSection />;
      case 'logout':
        return <LogoutSection />;
      default:
        return <PracticeSection />;
    }
  };

  return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
      <div className="mx-40">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent; 