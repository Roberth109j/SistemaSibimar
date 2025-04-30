import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center justify-center">
            <AppLogoIcon className="h-10 w-10 text-indigo-600" />
            <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                LMM
            </span>
        </div>
    );
}
