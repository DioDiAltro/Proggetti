// Tipi di base: quanto occupano, che valori contengono, come si convertono.
#include <climits>      // INT_MIN, INT_MAX, LLONG_MAX
#include <iostream>
using namespace std;

int main() {
    cout << "sizeof(int)       = " << sizeof(int) << " byte\n";
    cout << "sizeof(long long) = " << sizeof(long long) << " byte\n";
    cout << "sizeof(double)    = " << sizeof(double) << " byte\n";
    cout << "sizeof(char)      = " << sizeof(char) << " byte\n";
    cout << "sizeof(bool)      = " << sizeof(bool) << " byte\n";
    cout << "int va da " << INT_MIN << " a " << INT_MAX << '\n';
    cout << "long long arriva a " << LLONG_MAX << '\n';

    int a = 100000;
    long long giusto = 1LL * a * a;     // 1LL: il prodotto si fa in long long
    cout << "100000 * 100000 = " << giusto << '\n';

    char c = 'A';
    cout << c << " ha codice " << int(c) << ", la lettera dopo è " << char(c + 1) << '\n';

    double x = 7 / 2;       // divisione tra int (fa 3), poi conversione in double
    double y = 7 / 2.0;     // un operando è double: divisione reale
    cout << "7 / 2 = " << x << ",  7 / 2.0 = " << y << '\n';

    const double PI = 3.14159;
    int r = 2;
    cout << "area del cerchio di raggio 2: " << PI * r * r << '\n';

    bool pari = (a % 2 == 0);
    cout << "a è pari? " << pari << " (con boolalpha: " << boolalpha << pari << ")\n";
    return 0;
}
