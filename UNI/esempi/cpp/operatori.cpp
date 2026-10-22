// Operatori: divisione intera, resto, incremento, assegnamenti composti,
// valutazione corto circuito.
#include <iostream>
using namespace std;

int main() {
    cout << " 7 / 2 = " << 7 / 2 << "     7 % 2 = " << 7 % 2 << '\n';
    cout << "-7 / 2 = " << -7 / 2 << "    -7 % 2 = " << -7 % 2 << '\n';
    cout << " 7 / -2 = " << 7 / -2 << "    7 % -2 = " << 7 % -2 << '\n';
    cout << "(double)7 / 2 = " << (double)7 / 2 << '\n';

    int x = 5;
    int a = x++;            // a riceve il valore VECCHIO (5), poi x diventa 6
    int b = ++x;            // x diventa 7, poi b riceve il valore NUOVO (7)
    cout << "a = " << a << ", b = " << b << ", x = " << x << '\n';

    int s = 10;
    s += 5;                 // 15
    s *= 2;                 // 30
    s -= 1;                 // 29
    s /= 3;                 // 9: divisione intera
    s %= 4;                 // 1
    cout << "s = " << s << '\n';

    int v[3] = {4, 8, 15};
    for (int i = 0; i <= 3; i++) {
        // con i = 3 la prima condizione è falsa: v[3] non viene mai letto
        if (i < 3 && v[i] > 5) cout << "v[" << i << "] = " << v[i] << " è maggiore di 5\n";
    }
    return 0;
}
