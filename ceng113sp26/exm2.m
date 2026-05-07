Y0 = [3; 0; 0]; % [nA; nB; Xa]
[V, Y] = ode45(@myODE, [0 12], Y0);
plot(V, Y); legend('nA', 'nB', 'Xa');

function dYdV = myODE(V, Y)
nA = Y(1);
nB = Y(2);
Xa = Y(3);

r = 0.125*nA/0.5; % mol/L-s
rA = -r; rB = r; 
nA0 = 3;

dnAdV = rA; % mol/L-s, (7.1)
dnBdV = rB; % (7.2)
dXadV = -rA/nA0; % 1/L, (8.1)
dYdV = [dnAdV; dnBdV; dXadV];
end