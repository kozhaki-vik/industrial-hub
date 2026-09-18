import os

files_to_fix = {
    'src/views/ClanManagerTabs/DossierTab.jsx': ('DossierCardsSkeleton', "import { DossierCardsSkeleton } from '../../components/Skeleton';"),
    'src/views/ClanManagerTabs/RecruitmentTab.jsx': ('ApplicationsTableSkeleton', "import { ApplicationsTableSkeleton } from '../../components/Skeleton';"),
    'src/views/ClanManagerTabs/RosterTab.jsx': ('RosterSkeleton', "import { RosterSkeleton } from '../../components/Skeleton';"),
    'src/views/ClanManagerTabs/StatsTab.jsx': ('StatsTableSkeleton', "import { StatsTableSkeleton } from '../../components/Skeleton';")
}

for filepath, (import_name, import_stmt) in files_to_fix.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # insert import after lucide-react import block
    if import_name not in code[:1000]:
        code = code.replace("from '../ClanManager';", f"from '../ClanManager';\n{import_stmt}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)
            print(f"Fixed {filepath}")
