// Fattoriale ricorsivo: n! = n * (n-1)!, con 0! = 1. Accanto, la versione
// iterativa: stesso risultato, ma senza consumare stack.
#include <iostream>
using namespace std;

//@region fatt
long long fattoriale(int n) {
    if (n == 0) return 1;                   //@base
    return n * fattoriale(n - 1);           //@rec
}
//@endregion

//@region iter
long long fattorialeIterativo(int n) {
    long long f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    return f;
}
//@endregion

int main() {
    for (int n = 0; n <= 20; n += 5)
        cout << n << "! = " << fattoriale(n) << "   (iterativo: " << fattorialeIterativo(n) << ")\n";
    return 0;
}
