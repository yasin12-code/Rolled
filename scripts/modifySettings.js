const fs = require('fs');
let content = fs.readFileSync('app/(dashboard)/settings/page.tsx', 'utf8');

const replacement = `
  </Card>

  <Card>
    <CardHeader className="bg-gray-50/50">
      <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
      <CardDescription>Irreversible destructive actions</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Delete Company</h3>
          <p className="text-sm text-gray-500 mt-1">Permanently remove your company and all data.</p>
        </div>
        <Button variant="danger">Delete Account</Button>
      </div>
    </CardContent>
  </Card>
  
  <Card className="mt-6 border-dashed border-primary">
    <CardHeader className="bg-primary/5">
      <CardTitle className="text-lg text-primary flex items-center gap-2">
        <Database size={18} />
        Developer Tools
      </CardTitle>
      <CardDescription>Push the local mock data up to your new Firebase Firestore instance.</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      <Button onClick={handleSeedDatabase} disabled={isSeeding} className="w-full">
        <UploadCloud size={16} className="mr-2" />
        {isSeeding ? "Uploading to Firestore..." : "Seed Firebase Database"}
      </Button>
    </CardContent>
  </Card>
  </>
  )}`;

content = content.replace(/<\/Card>\s*}\)/g, replacement);
fs.writeFileSync('app/(dashboard)/settings/page.tsx', content);
