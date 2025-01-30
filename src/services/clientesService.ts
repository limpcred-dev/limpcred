@@ .. @@
   async listarPorEmpresa(empresaId: string): Promise<Cliente[]> {
     try {
       const q = query(
         collection(db, 'clientes'),
         where('empresaId', '==', empresaId)
       );
       
       const snapshot = await getDocs(q);
-      return snapshot.docs.map(doc => ({
-        id: doc.id,
-        ...doc.data()
-      }));
+      return snapshot.docs.map(doc => {
+        const data = doc.data();
+        return {
+          id: doc.id,
+          ...data,
+          dataCadastro: data.dataCadastro?.toDate() || new Date()
+        } as Cliente;
+      });
     } catch (error) {
       console.error('Erro ao listar clientes:', error);
       throw new Error('Não foi possível carregar os clientes');